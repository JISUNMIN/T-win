/**
 * TDropdown
 *
 * @module TDropdown
 */

import css from './TDropDown.module.less';
import classNames from 'classnames';
import Dropdown from '@enact/sandstone/Dropdown';

const TDropdown = ({className, children, ...rest}) => {
	return (
		<Dropdown
			className={classNames(css.tDrapdown, className)}
			direction="below"
			size="small"
			width="small"
			{...rest}
		>
			{children}
	</Dropdown>
	);
};

export default TDropdown;