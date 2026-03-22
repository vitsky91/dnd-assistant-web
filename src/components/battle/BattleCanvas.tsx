import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Line, Circle, Text } from 'react-konva'
import type Konva from 'konva'
import { TILE_COLORS } from '../../stores/mapStore'
import { useBattleStore } from '../../stores/battleStore'
import type { Channel } from 'phoenixjs'
import { pushMoveToken, pushRevealFog, pushHideFog } from '../../socket/sessionSocket'
import type { TileType } from '../../types'

const GRID_COLOR = '#2A3347'
const FOG_COLOR = '#000000'
const FOG_ALPHA = 0.85

// Deterministic color from string (character_id)
function tokenColor(id: string): string {
  const colors = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7']
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return colors[Math.abs(hash) % colors.length]
}

type FogTool = 'none' | 'reveal' | 'hide'

interface Props {
  containerWidth: number
  containerHeight: number
  channel: Channel
  currentUserId: string
}

export function BattleCanvas({ containerWidth, containerHeight, channel, currentUserId }: Props) {
  const { map, battleState, isDM, selectedTokenCharacterId, selectToken } = useBattleStore()
  const stageRef = useRef<Konva.Stage>(null)
  const isDrawing = useRef(false)
  const lastCell = useRef<{ x: number; y: number } | null>(null)
  const fogCells = useRef<{ x: number; y: number }[]>([])

  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [fogTool, setFogTool] = useState<FogTool>('none')

  // Center map on load
  useEffect(() => {
    if (!map) return
    const mapWidth = map.width * map.cell_size
    const mapHeight = map.height * map.cell_size
    setStagePos({
      x: (containerWidth - mapWidth) / 2,
      y: (containerHeight - mapHeight) / 2,
    })
    setScale(1)
  }, [map?.id, containerWidth, containerHeight])

  const getCellFromPointer = useCallback(
    (stage: Konva.Stage): { x: number; y: number } | null => {
      if (!map) return null
      const pointer = stage.getPointerPosition()
      if (!pointer) return null
      const cellX = Math.floor((pointer.x - stagePos.x) / (map.cell_size * scale))
      const cellY = Math.floor((pointer.y - stagePos.y) / (map.cell_size * scale))
      if (cellX < 0 || cellY < 0 || cellX >= map.width || cellY >= map.height) return null
      return { x: cellX, y: cellY }
    },
    [map, stagePos, scale]
  )

  // Get character_id at a cell (or null)
  const getTokenAtCell = useCallback(
    (cell: { x: number; y: number }): string | null => {
      if (!battleState) return null
      for (const [charId, pos] of Object.entries(battleState.token_positions)) {
        if (pos.x === cell.x && pos.y === cell.y) return charId
      }
      return null
    },
    [battleState]
  )

  // Check if current player can move a token
  const canMoveToken = useCallback(
    (characterId: string): boolean => {
      if (isDM) return true
      if (!battleState || battleState.status !== 'active') return false
      const current = battleState.initiative_order[battleState.current_turn_index]
      if (!current) return false
      // Player can only move their own character on their turn
      return current.player_id === currentUserId && current.character_id === characterId
    },
    [isDM, battleState, currentUserId]
  )

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return
      const stage = stageRef.current
      if (!stage) return
      const cell = getCellFromPointer(stage)
      if (!cell) return

      // ── Fog tools (DM only) ──
      if (isDM && fogTool !== 'none') {
        isDrawing.current = true
        fogCells.current = [cell]
        lastCell.current = cell
        return
      }

      // ── Token movement ──
      if (selectedTokenCharacterId) {
        // Second click: move token to this cell
        const from = battleState?.token_positions[selectedTokenCharacterId]
        if (from) {
          pushMoveToken(channel, selectedTokenCharacterId, from, cell)
        }
        selectToken(null)
        return
      }

      // First click: select a token
      const tokenId = getTokenAtCell(cell)
      if (tokenId && canMoveToken(tokenId)) {
        selectToken(tokenId)
      }
    },
    [isDM, fogTool, selectedTokenCharacterId, battleState, channel, getCellFromPointer, getTokenAtCell, canMoveToken, selectToken]
  )

  const handleMouseMove = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing.current) return
      if (fogTool === 'none') return
      const stage = stageRef.current
      if (!stage) return
      const cell = getCellFromPointer(stage)
      if (!cell) return
      if (lastCell.current?.x === cell.x && lastCell.current?.y === cell.y) return
      lastCell.current = cell
      fogCells.current.push(cell)
    },
    [fogTool, getCellFromPointer]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (fogTool !== 'none' && fogCells.current.length > 0) {
      if (fogTool === 'reveal') {
        pushRevealFog(channel, fogCells.current)
      } else {
        pushHideFog(channel, fogCells.current)
      }
      fogCells.current = []
    }
    lastCell.current = null
  }, [fogTool, channel])

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return
      const scaleBy = 1.1
      const oldScale = scale
      const pointer = stage.getPointerPosition()!
      const newScale = e.evt.deltaY < 0
        ? Math.min(oldScale * scaleBy, 4)
        : Math.max(oldScale / scaleBy, 0.2)
      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      }
      setScale(newScale)
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      })
    },
    [scale, stagePos]
  )

  const handleStageDragEnd = useCallback(
    (ev: Konva.KonvaEventObject<DragEvent>) => {
      setStagePos({ x: ev.target.x(), y: ev.target.y() })
    },
    []
  )

  if (!map) return null

  const cellSize = map.cell_size
  const mapPxW = map.width * cellSize
  const mapPxH = map.height * cellSize

  // Grid lines
  const gridLines: React.ReactNode[] = []
  for (let x = 0; x <= map.width; x++) {
    gridLines.push(
      <Line key={`v${x}`} points={[x * cellSize, 0, x * cellSize, mapPxH]}
        stroke={GRID_COLOR} strokeWidth={1} opacity={0.8} listening={false} />
    )
  }
  for (let y = 0; y <= map.height; y++) {
    gridLines.push(
      <Line key={`h${y}`} points={[0, y * cellSize, mapPxW, y * cellSize]}
        stroke={GRID_COLOR} strokeWidth={1} opacity={0.8} listening={false} />
    )
  }

  const fogState = battleState?.fog_state ?? {}
  const tokenPositions = battleState?.token_positions ?? {}
  const isDraggable = fogTool === 'none' && !selectedTokenCharacterId

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Fog toolbar — DM only */}
      {isDM && (
        <div className="flex gap-2 px-1">
          <button
            onClick={() => setFogTool(fogTool === 'hide' ? 'none' : 'hide')}
            className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
              fogTool === 'hide'
                ? 'bg-[#8B9BB0] text-[#0D0F14]'
                : 'bg-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1]'
            }`}
          >
            Fog Hide
          </button>
          <button
            onClick={() => setFogTool(fogTool === 'reveal' ? 'none' : 'reveal')}
            className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
              fogTool === 'reveal'
                ? 'bg-[#C9963A] text-[#0D0F14]'
                : 'bg-[#2A3347] text-[#8B9BB0] hover:text-[#F0EBE1]'
            }`}
          >
            Reveal
          </button>
          {fogTool !== 'none' && (
            <button
              onClick={() => setFogTool('none')}
              className="text-xs px-3 py-1 rounded-lg bg-[#161B24] text-[#8B9BB0] hover:text-[#F0EBE1]"
            >
              Done
            </button>
          )}
        </div>
      )}

      {selectedTokenCharacterId && (
        <div className="px-1 text-xs text-[#C9963A]">
          Click destination to move token — or click again to cancel
        </div>
      )}

      <Stage
        ref={stageRef}
        width={containerWidth}
        height={containerHeight - (isDM ? 36 : 0) - (selectedTokenCharacterId ? 20 : 0)}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        draggable={isDraggable}
        onDragEnd={handleStageDragEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: fogTool !== 'none' ? 'crosshair' : selectedTokenCharacterId ? 'cell' : 'default' }}
      >
        {/* Map background */}
        <Layer listening={false}>
          <Rect x={0} y={0} width={mapPxW} height={mapPxH} fill="#1A1A2E" />
        </Layer>

        {/* Tile layers */}
        {map.layers
          .filter((l) => l.type !== 'fog' && l.visible)
          .map((layer) => (
            <Layer key={layer.id} listening={false}>
              {Object.entries(layer.cells).map(([key, cell]) => {
                const [cx, cy] = key.split(',').map(Number)
                const color = cell.color ?? TILE_COLORS[cell.tile_type as TileType] ?? '#555'
                return (
                  <Rect key={key} x={cx * cellSize} y={cy * cellSize}
                    width={cellSize} height={cellSize} fill={color} />
                )
              })}
            </Layer>
          ))}

        {/* Grid */}
        <Layer listening={false}>{gridLines}</Layer>

        {/* Battle fog — hidden where fog_state[key] !== 'revealed' */}
        <Layer listening={false}>
          {Array.from({ length: map.height }, (_, y) =>
            Array.from({ length: map.width }, (_, x) => {
              const key = `${x},${y}`
              if (fogState[key] === 'revealed') return null
              return (
                <Rect key={key} x={x * cellSize} y={y * cellSize}
                  width={cellSize} height={cellSize}
                  fill={FOG_COLOR} opacity={FOG_ALPHA} />
              )
            })
          )}
        </Layer>

        {/* Token layer */}
        <Layer>
          {Object.entries(tokenPositions).map(([charId, pos]) => {
            const color = tokenColor(charId)
            const px = pos.x * cellSize + cellSize / 2
            const py = pos.y * cellSize + cellSize / 2
            const radius = cellSize * 0.38
            const isSelected = charId === selectedTokenCharacterId
            // Get display initial from initiative_order
            const entry = battleState?.initiative_order.find((e) => e.character_id === charId)
            const label = entry?.player_username?.[0]?.toUpperCase() ?? '?'

            return (
              <React.Fragment key={charId}>
                {isSelected && (
                  <Circle
                    x={px} y={py} radius={radius + 4}
                    fill="transparent" stroke="#C9963A" strokeWidth={2}
                  />
                )}
                <Circle
                  x={px} y={py} radius={radius}
                  fill={color} stroke="#0D0F14" strokeWidth={2}
                />
                <Text
                  x={px - radius} y={py - radius}
                  width={radius * 2} height={radius * 2}
                  text={label}
                  fontSize={radius * 0.9}
                  fontStyle="bold"
                  fill="#FFFFFF"
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
              </React.Fragment>
            )
          })}
        </Layer>

        {/* Hit area */}
        <Layer>
          <Rect x={0} y={0} width={mapPxW} height={mapPxH} fill="transparent" />
        </Layer>
      </Stage>
    </div>
  )
}
