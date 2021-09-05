import './App.css';

import {Map} from './components/Map';
import {useData} from './hooks/useData';

const width = 600;
const height = 800;

function App() {
	const data = useData();

	if (!data) {
		return <pre>Loading...</pre>;
	}

	return (
		<>
			<Map data={data} width={width} height={height} />
		</>
	);
}

export default App;
