import React from 'react';
import {geoTransverseMercator, geoPath, geoGraticule, select} from 'd3';
import ToolTip from './ToolTip';

export const Map = ({data: {dptos, provs}, width, height}) => {
	let active = select(null); // sort of D3 "state"

	const tooltip = React.useRef(null);
	const gContainerRef = React.useRef();
	const [tooltipContent, setTooltipContent] = React.useState(null);
	const [provinceName, setProvinceName] = React.useState(null);
	// const [prevGeoRef, setPrevGeoRef] = React.useState(gContainerRef);
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
		const {path: svgPath, w, h} = geo;

		let index = el => {
			return [...el.target.parentElement.children].indexOf(el.target);
		};

		let path = svgPath;

		let g = select(ref.parentElement);

		if (active.node() === ref) return reset(d, ref);
		active.classed('active', false);
		active = select(ref).classed('active', true);

		let idx = index(d);

		let bounds = path.bounds(provs.features[idx]);

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

	const handleMouseOverCountry = (evt, province) => {
		evt.stopPropagation();
		if (province.np === provinceName) return;
		setProvinceName(province.np);
		tooltip.current.style.display = 'block';
		tooltip.current.style.left = evt.pageX + 10 + 'px';
		tooltip.current.style.top = evt.pageY + 10 + 'px';
		setTooltipContent(renderTooltipContent(province));
	};

	const handleMouseLeaveCountry = () => {
		if (tooltip?.current) {
			tooltip.current.style.display = 'none';
		}
	};

	const handleMapReset = e => {
		select(gContainerRef).transition().duration(800).style('stroke-width', '1.5px').attr('transform', '');

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
					style={{fill: 'gray'}}
					className='province mesh'
					d={geo.path(feature)}
					ref={pathRef}
					// onMouseOver={e => {
					// 	handleMouseOverCountry(e, feature.properties);
					// }}
					// onMouseLeave={() => handleMouseLeaveCountry(feature)}
					onClick={handleMouseClick}
				/>
			</>
		);
	};

	const Localidades = ({feature, geo, dptos}) => {
		const pathRef = React.useRef();

		// console.log(feature);

		const handleMouseClick = e => {
			e.preventDefault();
			e.stopPropagation();
			console.log('localidades');
			// clicked(e, pathRef.current, geo, dptos);
		};

		const cloropeth = `rgba(0,250,255,${1 / feature?.properties?.nd?.length || 0.5})`;

		return (
			<>
				<path
					style={{fill: cloropeth}}
					className='localidad mesh'
					d={geo.path(feature)}
					ref={pathRef}
					// onMouseOver={e => {
					// 	handleMouseOverCountry(e, feature.properties);
					// }}
					// onMouseLeave={() => handleMouseLeaveCountry(feature)}
					onClick={handleMouseClick}
				/>
			</>
		);
	};

	React.useEffect(() => {
		setGeo(getGeoData(gContainerRef.current.parentElement));
	}, []);

	return (
		<div>
			<div ref={tooltip} style={{position: 'absolute', display: 'none'}}>
				<ToolTip>{tooltipContent}</ToolTip>
			</div>
			<svg width={width} height={height}>
				<rect className='background' onClick={handleMapReset}></rect>
				<g ref={gContainerRef}>
					{/* {geo?.path &&
						dptos?.features.map(feature => {
							return <Localidades key={feature.id} feature={feature} geo={geo} dptos={dptos} />;
						})} */}
					{geo?.path &&
						provs?.features.map(feature => {
							return <Provincias key={feature.id} feature={feature} geo={geo} provs={provs} />;
						})}
				</g>
			</svg>
		</div>
	);
};
