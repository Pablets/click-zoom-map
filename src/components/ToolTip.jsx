import React from 'react';
// import './Tooltip.scss';

const Tooltip = ({children}) => {
	// console.log(children);

	return (
		<div className='tooltip'>
			<div className='tooltip-content'>{children}</div>
		</div>
	);
};

export default Tooltip;
