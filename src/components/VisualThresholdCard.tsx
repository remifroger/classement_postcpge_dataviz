import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { CriterionConfig, ThresholdMap, SchoolData } from '../types';
import { motion } from 'motion/react';
import { RotateCcw, Info } from 'lucide-react';

interface VisualThresholdCardProps {
  criterion: CriterionConfig;
  thresholds: number[];
  initialThresholds: number[];
  data: SchoolData[];
  onChange: (newThresholds: number[]) => void;
  onReset: () => void;
}

export const VisualThresholdCard: React.FC<VisualThresholdCardProps> = ({
  criterion,
  thresholds,
  initialThresholds,
  data,
  onChange,
  onReset
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeScoreIdx, setActiveScoreIdx] = useState<number | null>(null);
  const scores = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const values = useMemo(() => {
    return data.map(s => s[criterion.brutKey]).filter(v => typeof v === 'number') as number[];
  }, [data, criterion.brutKey]);

  const stats = useMemo(() => {
    if (values.length === 0) return null;
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: d3.mean(values) || 0
    };
  }, [values]);

  useEffect(() => {
    if (!svgRef.current || values.length === 0 || !stats) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 160;
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };

    svg.selectAll("*").remove();

    const x = d3.scaleLinear()
      .domain([stats.min * 0.95, stats.max * 1.05])
      .range([margin.left, width - margin.right]);

    const bins = d3.bin()
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(30))(values);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)] as [number, number])
      .range([height - margin.bottom, margin.top]);

    // Draw bars
    svg.append("g")
      .attr("fill", "#e4e4e7") // zinc-200
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => x(d.x0!) + 1)
      .attr("width", d => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr("y", d => y(d.length))
      .attr("height", d => y(0) - y(d.length))
      .attr("rx", 2);

    // Draw X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text").attr("class", "text-[10px] fill-zinc-400 font-mono"));

    // Interaction layer
    const interaction = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .style("cursor", activeScoreIdx !== null ? "crosshair" : "default")
      .on("click", (event) => {
        if (activeScoreIdx === null) return;
        const [mx] = d3.pointer(event);
        const val = x.invert(mx);
        const newThresholds = [...thresholds];
        newThresholds[activeScoreIdx] = Number(val.toFixed(2));
        onChange(newThresholds);
      });

    // Draw threshold lines
    thresholds.forEach((t, i) => {
      const g = svg.append("g")
        .attr("class", "threshold-line")
        .style("cursor", "ew-resize");

      const lineX = x(t);
      
      // Hit area for dragging
      g.append("rect")
        .attr("x", lineX - 10)
        .attr("y", margin.top)
        .attr("width", 20)
        .attr("height", height - margin.top - margin.bottom)
        .attr("fill", "transparent")
        .style("cursor", "ew-resize")
        .call(d3.drag<SVGRectElement, any>()
          .container(svgRef.current!)
          .on("start", () => setActiveScoreIdx(i))
          .on("drag", (event) => {
            const mx = event.x;
            const val = x.invert(mx);
            if (isNaN(val)) return;
            
            const newThresholds = [...thresholds];
            newThresholds[i] = Number(val.toFixed(2));
            onChange(newThresholds);
          })
          .on("end", () => setActiveScoreIdx(null))
        );

      // Visual line
      const isActive = activeScoreIdx === i;
      g.append("line")
        .attr("x1", lineX)
        .attr("x2", lineX)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", isActive ? "#4f46e5" : "#a5b4fc") // indigo-600 or indigo-300
        .attr("stroke-width", isActive ? 2 : 1)
        .attr("stroke-dasharray", isActive ? "none" : "2,2");

      // Label
      g.append("text")
        .attr("x", lineX)
        .attr("y", margin.top - 5)
        .attr("text-anchor", "middle")
        .attr("class", `text-[9px] font-bold ${isActive ? 'fill-indigo-600' : 'fill-zinc-400'}`)
        .text(scores[i].toFixed(1));
    });

  }, [values, stats, thresholds, activeScoreIdx, onChange]);

  const isModified = JSON.stringify(thresholds) !== JSON.stringify(initialThresholds);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${
      isModified ? 'border-indigo-200 shadow-sm' : 'border-black/5'
    }`}>
      <div className="p-4 border-b border-black/5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">{criterion.label}</h3>
            <p className="text-[10px] text-zinc-400 font-mono">{criterion.brutKey}</p>
          </div>
          <div className="flex items-center gap-2">
            {isModified && (
              <button 
                onClick={onReset}
                className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
              criterion.type === 'higher_is_better' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {criterion.type === 'higher_is_better' ? 'Croissant' : 'Décroissant'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {scores.map((score, i) => (
            <button
              key={score}
              onClick={() => setActiveScoreIdx(activeScoreIdx === i ? null : i)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                activeScoreIdx === i 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                  : 'bg-zinc-50 border-black/5 text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {score.toFixed(1)}: {thresholds[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 relative">
        {activeScoreIdx !== null && (
          <div className="absolute top-2 left-4 z-10 flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[9px] font-bold animate-pulse">
            <Info className="w-3 h-3" />
            Cliquez sur le graphe pour régler le score {scores[activeScoreIdx].toFixed(1)}
          </div>
        )}
        <svg 
          ref={svgRef} 
          className="w-full h-[160px]"
        />
      </div>
    </div>
  );
};
