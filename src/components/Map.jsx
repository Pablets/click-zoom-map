import React from 'react';
import {geoTransverseMercator, geoPath, geoGraticule, select} from 'd3';
import ToolTip from './ToolTip';

export const Map = ({data: {dptos, provs}, width, height}) => {
	let active = select(null); // sort of D3 "state"

	const tooltip = React.useRef(null);
	const svgRef = React.useRef();
	const provincesContainerRef = React.useRef();
	const localidadesContainerRef = React.useRef();
	const [tooltipContent, setTooltipContent] = React.useState(null);
	const [provinceName, setProvinceName] = React.useState(null);
	const [geo, setGeo] = React.useState({path: null});
	const [isClicked, setIsClicked] = React.useState(false);

	function getGeoData(ref) {
		const svg = select(ref);
		const w = Number(svg.attr('width'));
		const h = Number(svg.attr('height'));

		const projection = geoTransverseMercator()
			.center([2.5, -38.5])
			.rotate([66, 0])
			.scale((h * 51) / 33) // (height*56.5)/33
			.translate([w / 2, h / 2]); // ..., height/2;

		const path = geoPath(projection);
		const graticule = geoGraticule();

		return {
			path,
			graticule,
			w,
			h
		};
	}

	function clicked(d, ref, geo, provs) {
		const {path, w, h} = geo;
		console.log('ref', ref.id);

		let index = el => {
			// console.log(el.target.parentElement.children);
			// const childNodes = [...el.target.parentElement.children];
			const filteredNode = provs.features.findIndex((node, i) => node?.id === ref.id);
			console.log('filteredNode', filteredNode);
			return filteredNode;
		};

		let g = select(svgRef.current);

		if (active.node() === ref) return reset(d, ref);
		active.classed('active', false);
		active = select(ref).classed('active', true);

		let idx = index(d);
		console.log('provs', provs.features[idx]);

		let bounds = path.bounds(provs.features[idx]);
		// let bounds = path.bounds(d.target);
		console.log(bounds);
		console.log('hasta aca funciona');

		let dx = bounds[1][0] - bounds[0][0];
		let dy = bounds[1][1] - bounds[0][1];
		let x = (bounds[0][0] + bounds[1][0]) / 2;
		let y = (bounds[0][1] + bounds[1][1]) / 2;
		let scale = 0.8 / Math.max(dx / w, dy / h);
		let translate = [w / 2 - scale * x, h / 2 - scale * y];

		g.transition()
			.duration(770)
			.style('stroke-width', 1.5 / scale + 'px')
			.attr('transform', 'translate(' + translate + ') scale(' + scale + ')');
	}

	function reset(d, ref) {
		let g = select(ref.parentElement);

		active.classed('active', false);
		active = select(null);

		g.transition().duration(800).style('stroke-width', '1.5px').attr('transform', '');
	}

	const handleMapReset = e => {
		select(provincesContainerRef).transition().duration(800).style('stroke-width', '1.5px').attr('transform', '');

		// reset(e, gContainerRef);
	};

	const renderTooltipContent = province => {
		return (
			<div className='tooltip-content'>
				<h1 className='WorldMap--tooltip--title'>{province.np}</h1>
			</div>
		);
	};

	const Provincias = ({feature, geo, provs}) => {
		const pathRef = React.useRef();

		// console.log('ref', pathRef);

		const handleMouseClick = e => {
			e.preventDefault();
			e.stopPropagation();
			clicked(e, pathRef.current, geo, provs);
		};

		// const cloropeth = `rgba(0,250,255,${1 / feature?.properties?.np?.length || 0.5})`;

		return (
			<>
				<path
					// style={{fill: 'gray'}}
					id={feature.id}
					className='province mesh'
					d={geo.path(feature)}
					ref={pathRef}
					onClick={handleMouseClick}
				/>
			</>
		);
	};

	const Localidades = ({feature, geo, dptos}) => {
		const deptoRef = React.useRef();

		const handleMouseClick = e => {
			e.preventDefault();
			e.stopPropagation();
			console.log(feature?.properties?.nd);
			// clicked(e, deptoRef.current, geo, dptos);
		};

		const cloropeth = `rgba(0,250,255,${1 / feature?.properties?.nd?.length || 0.5})`;

		return <path style={{fill: cloropeth}} className='localidad mesh' d={geo.path(feature)} ref={deptoRef} onClick={handleMouseClick} />;
	};

	React.useEffect(() => {
		setGeo(getGeoData(svgRef.current));
	}, []);

	return (
		<div>
			<div ref={tooltip} style={{position: 'absolute', display: 'none'}}>
				<ToolTip>{tooltipContent}</ToolTip>
			</div>
			<svg ref={svgRef} width={width} height={height}>
				<rect className='background' onClick={handleMapReset}></rect>
				{geo.path && (
					<g ref={localidadesContainerRef}>
						{dptos?.features.map(feature => {
							return <Localidades key={feature.id} feature={feature} geo={geo} dptos={dptos} />;
						})}
						{provs?.features.map(feature => {
							return <Provincias key={feature.id} feature={feature} geo={geo} provs={provs} />;
						})}
					</g>
				)}
			</svg>
		</div>
	);
};
