import { useRef, useCallback, useEffect, useState, useMemo } from 'react'
import { Stage, Layer, Rect, Line, Group } from 'react-konva'
import type Konva from 'konva'
import type React from 'react'
import { useMapStore, TILE_COLORS } from '../../stores/mapStore'
import type { TileType } from '../../types'

const FOG_COLOR = '#000000'
const FOG_ALPHA = 0.75
const GRID_COLOR = '#2A3347'
const GRID_ALPHA = 0.8

interface Props {
  containerWidth: number
  containerHeight: number
}

export function MapCanvas({ containerWidth, containerHeight }: Props) {
  const { map, activeTool, paintCell, eraseCell, saveToHistory } = useMapStore()
  const stageRef = useRef<Konva.Stage>(null)

  // Drawing state
  const isDrawing = useRef(false)
  const lastCell = useRef<{ x: number; y: number } | null>(null)

  // Pan via right mouse
  const isPanning = useRef(false)
  const panLastPos = useRef({ x: 0, y: 0 })

  // Camera — refs keep values fresh inside event callbacks without deps
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)

  const applyOffset = useCallback((o: { x: number; y: number }) => {
    offsetRef.current = o
    setOffset(o)
  }, [])

  const applyScale = useCallback((s: number) => {
    scaleRef.current = s
    setScale(s)
  }, [])

  // Center map whenever a different map is loaded
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
  // The Group (offset + scale) handles the visual pan/zoom.
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

  const applyTool = useCallback(
    (cell: { x: number; y: number }) => {
      if (activeTool === 'eraser') {
        eraseCell(cell.x, cell.y)
      } else if (activeTool === 'brush' || activeTool === 'fog_reveal' || activeTool === 'fog_hide') {
        paintCell(cell.x, cell.y)
      }
    },
    [activeTool, paintCell, eraseCell]
  )

  // ── Mouse events ───────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Right button → pan
      if (e.evt.button === 2) {
        isPanning.current = true
        panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
        return
      }
      if (e.evt.button !== 0) return

      // Left button → draw
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return

      isDrawing.current = true
      saveToHistory()

      const cell = getCellAt(pos.x, pos.y)
      if (!cell) return
      lastCell.current = cell
      applyTool(cell)
    },
    [getCellAt, applyTool, saveToHistory]
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

      // Drawing
      if (!isDrawing.current) return
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return

      const cell = getCellAt(pos.x, pos.y)
      if (!cell) return
      if (lastCell.current?.x === cell.x && lastCell.current?.y === cell.y) return
      lastCell.current = cell
      applyTool(cell)
    },
    [getCellAt, applyTool, applyOffset]
  )

  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 2) isPanning.current = false
    else { isDrawing.current = false; lastCell.current = null }
  }, [])

  const handleMouseLeave = useCallback(() => {
    isPanning.current = false
    isDrawing.current = false
    lastCell.current = null
  }, [])

  const handleContextMenu = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault()
  }, [])

  // ── Scroll to zoom (zoom toward cursor) ────────────────────────────────────
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

      // Keep the point under cursor stationary
      applyOffset({
        x: pos.x - (pos.x - offsetRef.current.x) * (newScale / oldScale),
        y: pos.y - (pos.y - offsetRef.current.y) * (newScale / oldScale),
      })
      applyScale(newScale)
    },
    [applyOffset, applyScale]
  )

  if (!map) {
    return (
      <div className="flex items-center justify-center text-[#8B9BB0] text-sm"
        style={{ width: containerWidth, height: containerHeight }}>
        No map loaded
      </div>
    )
  }

  const cs = map.cell_size
  const mapW = map.width  * cs
  const mapH = map.height * cs

  // Grid lines — memoized: only recompute when map dimensions change
  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = []
    for (let x = 0; x <= map.width; x++) {
      lines.push(
        <Line key={`v${x}`} points={[x * cs, 0, x * cs, mapH]}
          stroke={GRID_COLOR} strokeWidth={1} opacity={GRID_ALPHA} listening={false} />
      )
    }
    for (let y = 0; y <= map.height; y++) {
      lines.push(
        <Line key={`h${y}`} points={[0, y * cs, mapW, y * cs]}
          stroke={GRID_COLOR} strokeWidth={1} opacity={GRID_ALPHA} listening={false} />
      )
    }
    return lines
  }, [map.width, map.height, cs, mapW, mapH])

  return (
    // Stage has NO x/y/scale — so getPointerPosition() returns raw canvas coords
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
      style={{ cursor: activeTool === 'eraser' ? 'cell' : 'crosshair' }}
    >
      {/* Single layer — all content inside a Group that handles pan/zoom */}
      <Layer>
        <Group x={offset.x} y={offset.y} scaleX={scale} scaleY={scale}>
          {/* Background */}
          <Rect x={0} y={0} width={mapW} height={mapH} fill="#1A1A2E" listening={false} />

          {/* Tile layers */}
          {map.layers
            .filter((l) => l.type !== 'fog' && l.visible)
            .map((layer) =>
              Object.entries(layer.cells).map(([key, cell]) => {
                const [cx, cy] = key.split(',').map(Number)
                const color = cell.color ?? TILE_COLORS[cell.tile_type as TileType] ?? '#555'
                return (
                  <Rect key={`${layer.id}-${key}`}
                    x={cx * cs} y={cy * cs} width={cs} height={cs}
                    fill={color} listening={false}
                  />
                )
              })
            )}

          {/* Grid */}
          {gridLines}

          {/* Fog */}
          {map.layers
            .filter((l) => l.type === 'fog' && l.visible)
            .map((layer) =>
              Object.entries(layer.cells).map(([key]) => {
                const [cx, cy] = key.split(',').map(Number)
                return (
                  <Rect key={`fog-${key}`}
                    x={cx * cs} y={cy * cs} width={cs} height={cs}
                    fill={FOG_COLOR} opacity={FOG_ALPHA} listening={false}
                  />
                )
              })
            )}
        </Group>

        {/* Transparent hit area — full Stage size, outside the Group (raw canvas coords) */}
        <Rect x={0} y={0} width={containerWidth} height={containerHeight} fill="transparent" />
      </Layer>
    </Stage>
  )
}
