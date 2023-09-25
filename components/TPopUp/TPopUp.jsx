import {useCallback, useEffect, useState, useMemo} from 'react';
import classNames from 'classnames';
import css from './TPopUp.module.less';
import Alert from '@enact/sandstone/Alert';
import ri from '@enact/ui/resolution';
import TButton from '../TButton/TButton';
import Spottable from '@enact/spotlight/Spottable';
import Spotlight from '@enact/spotlight';
import {SpotlightContainerDecorator} from '@enact/spotlight/SpotlightContainerDecorator';

const Container = SpotlightContainerDecorator({enterTo: "default-element", preserveId: true}, Spottable('div'));

const KINDS = ["textPopUp", "calendarPopUp", "imagePopUp", "termsPopup", "smartMatPopUp", "connectedPopup", "testSelectPopup"];

const TPopUp = ({kind, title, centerTitle, text, text1, subText, connectedText, image, button1text, button2text, button2disabled, onClick, onClose, children, className,  ...rest}) => {

	useEffect(() => {
		if (KINDS.indexOf(kind) < 0) {
				console.error('TPopUp kind error');
		}
	}, [kind]);

	useEffect(() => {
		setTimeout(() => {
			Spotlight.focus('button1');
			Spotlight.focus('button2');
		}, 0);
	}, []);

  const _onClose = useCallback((ev) => {
    console.log('onClose', ev);
		if(onClose){
			onClose(ev);
		}
  }, [onClose]);

	const onClickBtn = useCallback((index)=>(ev) => {
		if(onClick){
			onClick(index, ev);
		}
		if(index === 0){
      _onClose(ev);
    }
  }, [onClick, _onClose]);

	const buttonWidth = useMemo(() => (button2text ? ri.scale(500) : ri.scale(1040)), [button2text]);
	const hasText = title || text || subText || text1;
	const hasButton = button1text || button2text;

	return (
		<Alert {...rest}
			className={classNames(
				css.tPopUp,
				css[kind],
				className ? className : null,
			)}
			open
			onClose={_onClose}
			type={"overlay"}
		>
			<Container className={css.info}>
				{hasText &&
					<div className={css.textLayer}>
						{title &&  <div className={classNames(css.title, centerTitle ? css.centerTitle : null)}>{title}</div>}
						{text && <div className={css.text}>{text}</div>}
						{text1 && <div className={css.text}>{text1}</div>}
						{subText && <div className={css.subText}>{subText}</div>}
					</div>
				}
				{children}
				{kind === "imagePopUp" || "smartMatPopUp" && image && <img src={image}/>}
				{hasButton &&
					<div className={css.buttonLayer}>
						{button1text && <TButton spotlightId={'button1'} className={css.button1}  onClick={onClickBtn(0)} style={{width: buttonWidth}}>{button1text}</TButton>}
						{button2text && <TButton spotlightId={'button2'} className={css.button2} disabled={button2disabled} onClick={onClickBtn(1)} style={{width: buttonWidth}}>{button2text}</TButton>}
					</div>
				}
				{connectedText &&
					<div className={css.connectPopup}>
						<div className={css.connectedText}>{connectedText}</div>
					</div>
				}
			</Container>
		</Alert>
	);
};

export default TPopUp;