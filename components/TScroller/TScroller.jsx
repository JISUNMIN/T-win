/**
 * TScroller
 *
 * @module TScroller
 */

import classNames from 'classnames';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import css from './TScroller.module.less';
import Scroller from '@enact/sandstone/Scroller/Scroller';
import {Job} from '@enact/core/util';
import {on, off} from '@enact/core/dispatcher';

const TScroller = ({className, children, focusableScrollbar=true,...rest}) => {
    const isScrolling = useRef(false);
	const scrollPosition = useRef("top");
    const [onMoveScrollBarEffect, setOnMoveScrollBarEffect] = useState(false);
	const offMoveScrollBarEffect = new Job((func) => func(), 1000);

    const handleWheel = useCallback(() => {
        if (!onMoveScrollBarEffect) {
            setOnMoveScrollBarEffect(true);
            offMoveScrollBarEffect.current.start(setOnMoveScrollBarEffect);
        } else {
            return;
        }
    }, [offMoveScrollBarEffect, onMoveScrollBarEffect]);
    useEffect(() => {
        on('wheel', handleWheel, document.getElementById('TScroller'));
        return () => {
            off('wheel', handleWheel, document.getElementById('TScroller'));
        };
    }, [handleWheel]);

    const _onScrollStart = useCallback((ev) => {
		if(rest.onScrollStart){
			rest.onScrollStart(ev);
		}
		isScrolling.current = true;
		console.log('_onScrollStart',ev);
	}, []);
	const _onScrollStop = useCallback((ev) => {
		if(rest.onScrollStop){
			rest.onScrollStop(ev);
		}
		isScrolling.current = false;
		if(ev.reachedEdgeInfo){
			if(ev.reachedEdgeInfo.top){
				scrollPosition.current = "top";
			}else if(ev.reachedEdgeInfo.bottom){
				scrollPosition.current = "bottom";
			}else{
				scrollPosition.current = "middle";
			}
		}else{
			scrollPosition.current = "middle";
		}
	}, []);

    // delete rest.snapToCenter;
    return (
        <Scroller
            {...rest}
            onScrollStart = {_onScrollStart}
            onScrollStop = {_onScrollStop}
            id='TScroller'
            scrollMode='translate'
            focusableScrollbar={focusableScrollbar}
            className={classNames(className, css.tScroller, onMoveScrollBarEffect ? css.onMove : '')}
            direction='vertical'
            horizontalScrollbar='hidden'
            verticalScrollbar='auto'
            overscrollEffectOn={{
                arrowKey: false,
                drag: false,
                pageKey: false,
                track: false,
                wheel: false
            }}
        >
            {children}
        </Scroller>
    );
};

export default TScroller;
