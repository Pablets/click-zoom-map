import React from 'react';
import {json} from 'd3';
import {feature, mesh} from 'topojson-client';

const jsonUrl = 'https://elecciones2017.lanacion.com.ar/multimedia/proyectos/17/elecciones/elecciones_2017_paso_mapa_resultados/data/arg_opt.json';

export const useData = () => {
	const [data, setData] = React.useState(null);

	React.useEffect(() => {
		json(jsonUrl).then(topology => {
			console.log(topology);
			const {dptos, provs} = topology.objects;
			setData({
				provs: feature(topology, provs),
				dptos: feature(topology, dptos)
			});
		});
	}, []);

	return data;
};
