import css from "./TSimpleDatePicker.module.less";
import * as Utils from "../../utils/helperMethods";
import Button from "@enact/sandstone/Button";
import classNames from "classnames";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { SpotlightContainerDecorator } from "@enact/spotlight/SpotlightContainerDecorator";
import { Job } from "@enact/core/util";
import { useDispatch, useSelector } from "react-redux";
import { $L } from "../../utils/helperMethods";
import { TIconButton, ICON_TYPES } from "../TIconButton/TIconButton";
import TPopUp from "../../components/TPopUp/TPopUp";
import TCalendar from "../../components/TCalendar/TCalendar";
import * as HelperMethods from "../../utils/helperMethods";

const Container = SpotlightContainerDecorator(
  { enterTo: "last-focused" },
  "div"
);

//period : total, quarterly, monthly, weekly
//whitelist: ["2023-09-19", "2023-08-03"] // only for total period
const DatePicker = ({
  period = "monthly",
  selectedDate,
  onSelectedDate,
  handleDateRange,
  iconType = [ICON_TYPES.leftArrow, ICON_TYPES.rightArrow, ICON_TYPES.calendar],
  whitelist = null, //only for total period
}) => {
  const [moveState, setMoveState] = useState("");
  const [dateItems, setDateItems] = useState([]);
  const [formattedDateStrings, setFormattedDateStrings] = useState([]);
  const [_selectedDate, _setSelectedDate] = useState(selectedDate);
  const [calendarSelectedDateStr, setCalendarSelectedDateStr] = useState("");

  useEffect(() => {
    let newSelectedDate = selectedDate ? selectedDate : new Date();
    if (period === "total" && whitelist && whitelist.length > 0) {
      const selectedDateStr = HelperMethods.convertDateToString2(selectedDate);
      if (selectedDateStr && whitelist.indexOf(selectedDateStr) < 0) {
        newSelectedDate = new Date(whitelist[whitelist.length - 1]);
      }
    }
    const newSelectedDateStr =
      HelperMethods.convertDateToString2(newSelectedDate);
    const _selectedDateStr = HelperMethods.convertDateToString2(_selectedDate);
    if (newSelectedDateStr !== _selectedDateStr) {
      _setSelectedDate(newSelectedDate);
    }
  }, [selectedDate, whitelist]);

  const [isCalendarClosed, setIsCalendarClosed] = useState(true);

  const appStatus = useSelector((state) => state.common.appStatus);

  const makeDateDisplay = (_period, language, date) => {
    let resultDateStr = "",
      firstday = "";

    if (_period === "weekly") {
      const firstDateOfThisWeek = new Date(date);
      firstDateOfThisWeek.setDate(
        firstDateOfThisWeek.getDate() - firstDateOfThisWeek.getDay()
      );
      const lastDateOfThisWeek = new Date(firstDateOfThisWeek);
      lastDateOfThisWeek.setDate(lastDateOfThisWeek.getDate() + 6);
      let yearMonStr = "";
      if (language === "ko") {
        //2021년 7월, 21~27
        yearMonStr = firstDateOfThisWeek.toLocaleDateString("default", {
          year: "numeric",
          month: "long",
        });
        resultDateStr =
          yearMonStr +
          ", " +
          firstDateOfThisWeek.getDate() +
          " ~ " +
          lastDateOfThisWeek.getDate();
      } else {
        yearMonStr = lastDateOfThisWeek.toLocaleDateString("default", {
          year: "numeric",
          month: "long",
        });
        resultDateStr =
          firstDateOfThisWeek.getDate() +
          " ~ " +
          lastDateOfThisWeek.getDate() +
          ", " +
          yearMonStr;
      }
      firstday = firstDateOfThisWeek; //"2021-07-14"
    } else if (_period === "monthly") {
      const today = new Date(date);
      resultDateStr = today.toLocaleDateString("default", {
        year: "numeric",
        month: "long",
      });
      firstday = today;
    } else if (_period === "yearly") {
      const today = new Date(date);
      resultDateStr = today.toLocaleDateString("default", { year: "numeric" });
      firstday = today;
    } else if (_period === "quarterly") {
      const currentDate = new Date(date);
      const currentMonth = currentDate.getMonth() + 1;
      const quarter = Math.ceil(currentMonth / 3);
      const yearStr = currentDate.toLocaleDateString("default", {
        year: "numeric",
      });
      const firstMonthOfQuarter = (quarter - 1) * 3 + 1;
      const lastMonthOfQuarter = firstMonthOfQuarter + 2;
      resultDateStr = `${yearStr} ${
        quarter + "분기"
      } (${firstMonthOfQuarter}월~${lastMonthOfQuarter}월)`;

      const firstDateOfQuarter = new Date(
        currentDate.getFullYear(),
        firstMonthOfQuarter - 1,
        1
      );
      firstday = firstDateOfQuarter;
    } else {
      // total
      const today = new Date(date);
      resultDateStr = today.toLocaleDateString("default", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      firstday = today;
    }
    return { firstday: firstday, showingStr: resultDateStr };
  };
  const popUpCalendar = useCallback(() => {
    setCalendarSelectedDateStr("");
    setIsCalendarClosed(!isCalendarClosed);
  }, [isCalendarClosed]);

  const updateCalendarClose = useCallback(() => {
    if (calendarSelectedDateStr) {
      const prevSelectedDateStr =
        HelperMethods.convertDateToString2(_selectedDate);
      if (prevSelectedDateStr !== calendarSelectedDateStr) {
        _setSelectedDate(new Date(calendarSelectedDateStr));
      }
    }
    popUpCalendar();
  }, [popUpCalendar, calendarSelectedDateStr, _selectedDate]);

  const updateDateItemsByPeriod = useCallback(
    (base) => {
      const today = base ? new Date(base) : new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      if (period === "monthly") {
        today.setDate(1);
      } else if (period === "yearly") {
        today.setMonth(0); //1월
        today.setDate(1); //1일
      }
      const _dateItems = [],
        _formattedDateStrings = [];
      for (let i = 0; i < 3; i++) {
        let res, gap;
        if (period === "total") {
          //전체
          gap = i === 0 ? -1 : i === 1 ? 0 : +1;
          if (whitelist && whitelist.length > 0) {
            const baseStr = Utils.timeToISO8601DateStr(today);
            const wIndex = whitelist.indexOf(baseStr);
            if (wIndex >= 0 && whitelist[wIndex + gap]) {
              res = makeDateDisplay(
                period,
                appStatus.language,
                new Date(whitelist[wIndex + gap])
              );
            } else {
              res = { firstday: "", showingStr: "" };
            }
          } else {
            res = makeDateDisplay(
              period,
              appStatus.language,
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + gap
              )
            );
          }
        } else if (period === "quarterly") {
          //분기
          gap = i === 0 ? -3 : i === 1 ? 0 : +3;
          res = makeDateDisplay(
            period,
            appStatus.language,
            new Date(
              today.getFullYear(),
              today.getMonth() + gap,
              today.getDate()
            )
          );
        } else if (period === "monthly") {
          //월간
          gap = i === 0 ? -1 : 1;
          res = makeDateDisplay(
            period,
            appStatus.language,
            today.setMonth(today.getMonth() + gap)
          );
        } else if (period === "weekly") {
          //주간
          gap = i === 0 ? -7 : 7;
          res = makeDateDisplay(
            period,
            appStatus.language,
            today.setDate(today.getDate() + gap)
          );
        }
        res ? _dateItems.push(res.firstday) : "";
        res ? _formattedDateStrings.push(res.showingStr) : "";
      }
      if (
        formattedDateStrings.toString() !== _formattedDateStrings.toString()
      ) {
        if (handleDateRange) {
          const firstdayStr = Utils.timeToISO8601DateStr(_dateItems[1]);
          let lastdayStr = "";
          if (_dateItems[2]) {
            const d = new Date(_dateItems[2]);
            d.setDate(d.getDate() - 1);
            lastdayStr = Utils.timeToISO8601DateStr(d);
          }
          handleDateRange({
            first: firstdayStr,
            last: lastdayStr ? lastdayStr : firstdayStr,
            previous: Utils.timeToISO8601DateStr(_dateItems[0]),
          });
        }
        setDateItems(_dateItems);
        setFormattedDateStrings(_formattedDateStrings);
      }
    },
    [period, handleDateRange, formattedDateStrings, moveState, whitelist]
  );

  const updateAfterMove = useCallback(() => {
    const targetIndex = moveState === "inc" ? 2 : 0;
    _setSelectedDate(dateItems[targetIndex]);
    setMoveState("");
  }, [dateItems, moveState]);

  const handleMoveClick = useCallback(
    (direction) => {
      if (moveState) {
        updateAfterMove();
      }
      setTimeout(() => {
        setMoveState(direction);
      }, 0);
    },
    [moveState, updateAfterMove]
  );

  const delayedMove = new Job(updateAfterMove, 300);

  useEffect(() => {
    updateDateItemsByPeriod(_selectedDate);
    if (onSelectedDate) {
      onSelectedDate({ selectedDate: _selectedDate });
    }
  }, [period, _selectedDate]);

  useEffect(() => {
    if (moveState) {
      delayedMove.start();
    }
  }, [moveState]);

  const disabledPrevBtn = useMemo(() => {
    if (!dateItems[0]) {
      return true;
    }
    return false;
  }, [dateItems]);

  const disabledNextBtn = useMemo(() => {
    if (dateItems?.[2] > new Date() || !dateItems[2]) {
      return true;
    }
    return false;
  }, [dateItems]);

  const onCalendarDateSelected = useCallback(
    ({ selectedDate: selectedDateStr }) => {
      setCalendarSelectedDateStr(selectedDateStr);
    },
    []
  );

  return (
    <Container
      className={classNames(
        css.datePicker
        // , period === "total" ? css.blurCss : null
      )}
    >
      <TIconButton
        iconType={iconType[2]}
        size={"small"}
        onClick={popUpCalendar}
      />
      {!isCalendarClosed && (
        <TPopUp
          kind="calendarPopUp"
          title={$L("날짜 선택")}
          button2text={$L("button2")}
          onClose={popUpCalendar}
          onClick={updateCalendarClose}
        >
          <TCalendar
            onSelectedDate={onCalendarDateSelected}
            selectedDate={_selectedDate}
            whitelist={
              period === "total" && whitelist && whitelist.length > 0
                ? whitelist
                : null
            }
          />
        </TPopUp>
      )}
      <div
        className={
          period === "quarterly"
            ? classNames(css.textLayer, css.largeTextWidth)
            : period === "weekly"
            ? classNames(css.textLayer, css.middleTextWidth)
            : css.textLayer
        }
      >
        <div
          className={classNames(css.text, moveState ? css[moveState] : null)}
        >
          {formattedDateStrings[0]}
        </div>
        <div
          className={classNames(css.text, moveState ? css[moveState] : null)}
        >
          {formattedDateStrings[1]}
        </div>
        <div
          className={classNames(css.text, moveState ? css[moveState] : null)}
        >
          {formattedDateStrings[2]}
        </div>
      </div>
      <div className={css.TIconLayer}>
        <TIconButton
          iconType={iconType[0]}
          className={css.chevron}
          aria-disabled={!formattedDateStrings[0]}
          onClick={() => handleMoveClick("dec")}
          size={"small"}
          tabIndex={0}
          disabled={disabledPrevBtn}
        />
        <TIconButton
          iconType={iconType[1]}
          className={css.chevron}
          aria-disabled={!formattedDateStrings[2]}
          onClick={() => handleMoveClick("inc")}
          size={"small"}
          tabIndex={1}
          disabled={disabledNextBtn}
        />
      </div>
    </Container>
  );
};

export default DatePicker;
