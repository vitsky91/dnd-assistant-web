import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { Stage, Layer, Rect, Line, Circle, Text, Group } from 'react-konva'
import type Konva from 'konva'
import { TILE_COLORS } from '../../stores/mapStore'
import { useBattleStore } from '../../stores/battleStore'
import type { Channel } from 'phoenixjs'
import { pushMoveToken, pushRevealFog, pushHideFog } from '../../socket/sessionSocket'
import type { TileType } from '../../types'

const GRID_COLOR = '#2A3347'
const FOG_COLOR = '#000000'
const FOG_ALPHA = 0.85

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
  const { map, battleState, isDM, selectedTokenCharacterId, selectToken, hpMap, conditions } = useBattleStore()
  const stageRef = useRef<Konva.Stage>(null)

  // Drawing state
  const isDrawing = useRef(false)
  const lastCell = useRef<{ x: number; y: number } | null>(null)
  const fogCells = useRef<{ x: number; y: number }[]>([])

  // Pan via right mouse
  const isPanning = useRef(false)
  const panLastPos = useRef({ x: 0, y: 0 })

  // Camera — refs for fresh values in callbacks, state for re-render
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)

  const [fogTool, setFogTool] = useState<FogTool>('none')

  const applyOffset = useCallback((o: { x: number; y: number }) => {
    offsetRef.current = o
    setOffset(o)
  }, [])

  const applyScale = useCallback((s: number) => {
    scaleRef.current = s
    setScale(s)
  }, [])

  // Center map on load
  useEffect(() => {
    if (!map) return
    applyOffset({
      x: (containerWidth  - map.width  * map.cell_size) / 2,
      y: (containerHeight - map.height * map.cell_size) / 2,
    })
    applyScale(1)
  }, [map?.id, containerWidth, containerHeight])

  // ── Cell from raw canvas coords ────────────────────────────────────────────
  // Stage has NO transform — getPointerPosition() returns raw canvas coords.
  const getCellAt = useCallback(
    (canvasX: number, canvasY: number): { x: number; y: number } | null => {
      if (!map) return null
      const cellX = Math.floor((canvasX - offsetRef.current.x) / (map.cell_size * scaleRef.current))
      const cellY = Math.floor((canvasY - offsetRef.current.y) / (map.cell_size * scaleRef.current))
      if (cellX < 0 || cellY < 0 || cellX >= map.width || cellY >= map.height) return null
      return { x: cellX, y: cellY }
    },
    [map]
  )

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

  const canMoveToken = useCallback(
    (characterId: string): boolean => {
      if (isDM) return true
      if (!battleState || battleState.status !== 'active') return false
      const current = battleState.initiative_order[battleState.current_turn_index]
      if (!current) return false
      return current.player_id === currentUserId && current.character_id === characterId
    },
    [isDM, battleState, currentUserId]
  )

  // ── Mouse events ───────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Right click → cancel token selection or pan
      if (e.evt.button === 2) {
        if (selectedTokenCharacterId) {
          selectToken(null)
          return
        }
        isPanning.current = true
        panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
        return
      }
      if (e.evt.button !== 0) return

      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return
      const cell = getCellAt(pos.x, pos.y)
      if (!cell) return

      // Fog tools (DM only)
      if (isDM && fogTool !== 'none') {
        isDrawing.current = true
        fogCells.current = [cell]
        lastCell.current = cell
        return
      }

      // Token movement: second click moves to destination
      if (selectedTokenCharacterId) {
        const from = battleState?.token_positions[selectedTokenCharacterId]
        if (from) pushMoveToken(channel, selectedTokenCharacterId, from, cell)
        selectToken(null)
        return
      }

      // First click: select a token
      const tokenId = getTokenAtCell(cell)
      if (tokenId && canMoveToken(tokenId)) selectToken(tokenId)
    },
    [isDM, fogTool, selectedTokenCharacterId, battleState, channel, getCellAt, getTokenAtCell, canMoveToken, selectToken]
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Panning
      if (isPanning.current) {
        const dx = e.evt.clientX - panLastPos.current.x
        const dy = e.evt.clientY - panLastPos.current.y
        panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
        applyOffset({ x: offsetRef.current.x + dx, y: offsetRef.current.y + dy })
        return
      }

      if (!isDrawing.current || fogTool === 'none') return
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return
      const cell = getCellAt(pos.x, pos.y)
      if (!cell) return
      if (lastCell.current?.x === cell.x && lastCell.current?.y === cell.y) return
      lastCell.current = cell
      fogCells.current.push(cell)
    },
    [fogTool, getCellAt, applyOffset]
  )

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 2) {
        isPanning.current = false
        return
      }
      isDrawing.current = false
      if (fogTool !== 'none' && fogCells.current.length > 0) {
        if (fogTool === 'reveal') pushRevealFog(channel, fogCells.current)
        else pushHideFog(channel, fogCells.current)
        fogCells.current = []
      }
      lastCell.current = null
    },
    [fogTool, channel]
  )

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false
    isDrawing.current = false
    lastCell.current = null
  }, [])

  const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault()
  }, [])

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return
      const scaleBy = 1.1
      const oldScale = scaleRef.current
      const newScale = e.evt.deltaY < 0
        ? Math.min(oldScale * scaleBy, 4)
        : Math.max(oldScale / scaleBy, 0.2)
      applyOffset({
        x: pos.x - (pos.x - offsetRef.current.x) * (newScale / oldScale),
        y: pos.y - (pos.y - offsetRef.current.y) * (newScale / oldScale),
      })
      applyScale(newScale)
    },
    [applyOffset, applyScale]
  )

  if (!map) return null

  const cellSize = map.cell_size
  const mapPxW = map.width  * cellSize
  const mapPxH = map.height * cellSize

  const fogState = battleState?.fog_state ?? {}
  const tokenPositions = battleState?.token_positions ?? {}

  const cursor = fogTool !== 'none' ? 'crosshair' : selectedTokenCharacterId ? 'cell' : isPanning.current ? 'grab' : 'default'

  return (
    <div className="flex flex-col h-full">
      {/* Fog toolbar — DM only */}
      {isDM && (
        <div className="flex gap-2 px-2 py-1 shrink-0">
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
          <span className="text-xs text-[#4A5568] self-center ml-2">Right-click drag to pan</span>
        </div>
      )}

      {selectedTokenCharacterId && (
        <div className="px-2 py-0.5 text-xs text-[#C9963A] shrink-0">
          Click destination to move token — right-click to cancel
        </div>
      )}

      {/* Stage has NO x/y/scale — getPointerPosition() returns raw canvas coords */}
      <Stage
        ref={stageRef}
        width={containerWidth}
        height={containerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        style={{ cursor, flex: 1 }}
      >
        <Layer>
          {/* All visual content in a Group with pan/zoom transform */}
          <Group x={offset.x} y={offset.y} scaleX={scale} scaleY={scale} listening={false}>
            {/* Background */}
            <Rect x={0} y={0} width={mapPxW} height={mapPxH} fill="#1A1A2E" />

            {/* Tile layers */}
            {map.layers
              .filter((l) => l.type !== 'fog' && l.visible)
              .map((layer) =>
                Object.entries(layer.cells).map(([key, cell]) => {
                  const [cx, cy] = key.split(',').map(Number)
                  const color = cell.color ?? TILE_COLORS[cell.tile_type as TileType] ?? '#555'
                  return (
                    <Rect key={`${layer.id}-${key}`}
                      x={cx * cellSize} y={cy * cellSize}
                      width={cellSize} height={cellSize}
                      fill={color}
                    />
                  )
                })
              )}

            {/* Grid */}
            <GridLines width={map.width} height={map.height} cellSize={cellSize} mapPxW={mapPxW} mapPxH={mapPxH} />

            {/* Fog — all cells hidden unless revealed */}
            {Array.from({ length: map.height }, (_, y) =>
              Array.from({ length: map.width }, (_, x) => {
                const key = `${x},${y}`
                if (fogState[key] === 'revealed') return null
                return (
                  <Rect key={`fog-${key}`}
                    x={x * cellSize} y={y * cellSize}
                    width={cellSize} height={cellSize}
                    fill={FOG_COLOR} opacity={FOG_ALPHA}
                  />
                )
              })
            )}

            {/* Tokens */}
            {Object.entries(tokenPositions).map(([charId, pos]) => {
              const color = tokenColor(charId)
              const px = pos.x * cellSize + cellSize / 2
              const py = pos.y * cellSize + cellSize / 2
              const radius = cellSize * 0.38
              const isSelected = charId === selectedTokenCharacterId
              const entry = battleState?.initiative_order.find((e) => e.character_id === charId)
              const label = entry?.player_username?.[0]?.toUpperCase() ?? '?'

              // HP bar
              const hp = hpMap[charId]
              const barW = cellSize * 0.76
              const barH = 4
              const barX = pos.x * cellSize + (cellSize - barW) / 2
              const barY = pos.y * cellSize + cellSize - barH - 3
              const hpRatio = hp ? Math.max(0, Math.min(1, hp.hp / hp.max_hp)) : null
              const hpColor = hpRatio == null ? '#555'
                : hpRatio > 0.5 ? '#52B788'
                : hpRatio > 0.25 ? '#F4A261'
                : '#E63946'

              // Condition badges
              const tokenConditions = conditions[charId] ?? []
              const CONDITION_ABBR: Record<string, string> = {
                poisoned: 'Po', stunned: 'St', blinded: 'Bl', paralyzed: 'Pa',
                prone: 'Pr', invisible: 'In', frightened: 'Fr', grappled: 'Gr',
                restrained: 'Re', exhausted: 'Ex', dead: 'De',
              }
              const CONDITION_COLOR: Record<string, string> = {
                poisoned: '#52B788', stunned: '#F4A261', blinded: '#8B9BB0',
                paralyzed: '#B07AA1', prone: '#7A5530', invisible: '#4E79A7',
                frightened: '#E8B84B', grappled: '#76B7B2', restrained: '#E15759',
                exhausted: '#555577', dead: '#9B2335',
              }
              const badgeSize = Math.max(10, cellSize * 0.2)

              return (
                <React.Fragment key={charId}>
                  {isSelected && (
                    <Circle x={px} y={py} radius={radius + 4}
                      fill="transparent" stroke="#C9963A" strokeWidth={2} />
                  )}
                  <Circle x={px} y={py} radius={radius}
                    fill={color} stroke="#0D0F14" strokeWidth={2} />
                  <Text
                    x={px - radius} y={py - radius}
                    width={radius * 2} height={radius * 2}
                    text={label} fontSize={radius * 0.9} fontStyle="bold"
                    fill="#FFFFFF" align="center" verticalAlign="middle"
                  />

                  {/* HP bar */}
                  {hpRatio !== null && (
                    <>
                      <Rect x={barX} y={barY} width={barW} height={barH}
                        fill="#1A1A2E" cornerRadius={2} />
                      <Rect x={barX} y={barY} width={barW * hpRatio} height={barH}
                        fill={hpColor} cornerRadius={2} />
                    </>
                  )}

                  {/* Condition badges */}
                  {tokenConditions.slice(0, 4).map((cond, i) => {
                    const bx = pos.x * cellSize + i * (badgeSize + 1)
                    const by = pos.y * cellSize
                    return (
                      <React.Fragment key={cond}>
                        <Circle x={bx + badgeSize / 2} y={by + badgeSize / 2}
                          radius={badgeSize / 2}
                          fill={CONDITION_COLOR[cond] ?? '#555'} opacity={0.9} />
                        <Text
                          x={bx} y={by}
                          width={badgeSize} height={badgeSize}
                          text={CONDITION_ABBR[cond] ?? cond.slice(0, 2).toUpperCase()}
                          fontSize={badgeSize * 0.5} fill="#FFF"
                          align="center" verticalAlign="middle"
                        />
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </Group>

          {/* Hit area at raw canvas coords — receives all mouse events */}
          <Rect x={0} y={0} width={containerWidth} height={containerHeight} fill="transparent" />
        </Layer>
      </Stage>
    </div>
  )
}

// Memoized grid: only recomputes when map dimensions change
const GridLines = React.memo(function GridLines({
  width, height, cellSize, mapPxW, mapPxH,
}: {
  width: number; height: number; cellSize: number; mapPxW: number; mapPxH: number
}) {
  const lines = useMemo(() => {
    const result: React.ReactNode[] = []
    for (let x = 0; x <= width; x++) {
      result.push(
        <Line key={`v${x}`} points={[x * cellSize, 0, x * cellSize, mapPxH]}
          stroke={GRID_COLOR} strokeWidth={1} opacity={0.8} listening={false} />
      )
    }
    for (let y = 0; y <= height; y++) {
      result.push(
        <Line key={`h${y}`} points={[0, y * cellSize, mapPxW, y * cellSize]}
          stroke={GRID_COLOR} strokeWidth={1} opacity={0.8} listening={false} />
      )
    }
    return result
  }, [width, height, cellSize, mapPxW, mapPxH])
  return <>{lines}</>
})
