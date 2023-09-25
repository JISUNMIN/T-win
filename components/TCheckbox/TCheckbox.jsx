import classNames from 'classnames';
import Spottable from '@enact/spotlight/Spottable';
import React, {useCallback} from 'react';
import css from './TCheckbox.module.less';

/**
 * TCheckbox
 *
 * @module TCheckbox
 */

const SpottableComponent = Spottable('div');

const TCheckbox = ({className, children, spotlightId, selected, onToggle, ...rest}) => {

	const _onClick = useCallback(() => {
		if(onToggle){
			onToggle({selected: !selected});
		}
	}, [onToggle, selected]);

	return (
		<SpottableComponent
				{...rest}
				className={classNames(className, css.tcheckbox)}
				onClick={_onClick}
				data-webos-voice-intent={'Select'}
				data-webos-voice-label={children}
				spotlightId={spotlightId}
			>
			<div className={css.wrapper}>
				<div className={css.checkboxBG}/>
				{selected &&
					<div className={css.selected}/>
				}
			</div>
		</SpottableComponent>
	);
};

export default TCheckbox;