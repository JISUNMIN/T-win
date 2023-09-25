import React, { useState, useCallback, useEffect, useMemo } from "react";
import classNames from "classnames";
import ilib from "ilib/lib/ilib";
import LocaleInfo from "ilib/lib/LocaleInfo";
import Spottable from "@enact/spotlight/Spottable";
import { SpotlightContainerDecorator } from "@enact/spotlight/SpotlightContainerDecorator";
import css from "./TCalendar.module.less";

import DatePicker from "../TDatePicker/DatePicker";
import { $L } from "../../utils/helperMethods";
import * as HelperMethods from "../../utils/helperMethods";

const DEFAULT_WEEKDAYS = [
  $L("S"),
  $L("M"),
  $L("T"),
  $L("W"),
  $L("T"),
  $L("F"),
  $L("S"),
];

const SpottableComponent = Spottable("div");
const Container = SpotlightContainerDecorator(
  { enterTo: "last-focused" },
  "div"
);
//  selectedDate: 기본값: Wed Aug 30 2023 13:05:09 GMT+0900 (한국 표준시)
//                달력 날짜 선택시: "2022-04-29"

const TCalendarItem = ({ data, onClick, selectedDateStr, ...rest }) => {
  const selected = useMemo(() => {
    const dateStr = HelperMethods.convertDateToString(
      data.year,
      data.month,
      data.date
    );
    return data.spotlight && dateStr === selectedDateStr;
  }, [data, selectedDateStr]);

  const _onClick = useCallback(
    (ev) => {
      if (data.disabled || !data.spotlight) {
        ev.stopPropagation();
        return;
      }
      if (onClick) {
        onClick(
          HelperMethods.convertDateToString(data.year, data.month, data.date)
        );
      }
    },
    [onClick, data]
  );

  return (
    <SpottableComponent
      {...rest}
      className={classNames(
        css.calendarItem,
        selected ? css.selected : null,
        data.disabled && css.disabled
      )}
      spotlightDisabled={!data.spotlight}
      disabled={data.disabled}
      onClick={_onClick}
    >
      <div className={classNames(css.title, data.dark ? css.dark : null)}>
        {data.date}
      </div>
    </SpottableComponent>
  );
};

const TCalendar = ({
  onSelectedDate,
  selectedDate = null,
  whitelist = null,
}) => {
  const [_selectedDate, _setSelectedDate] = useState(new Date());

  useEffect(() => {
    let newSelectedDate = selectedDate ? selectedDate : new Date();
    const newSelectedDateStr =
      HelperMethods.convertDateToString2(newSelectedDate);
    const _selectedDateStr = HelperMethods.convertDateToString2(_selectedDate);
    if (newSelectedDateStr !== _selectedDateStr) {
      _setSelectedDate(newSelectedDate);
    }
  }, [selectedDate]);
  const year = useMemo(() => {
    return _selectedDate.getFullYear();
  }, [_selectedDate]);

  const month = useMemo(() => {
    return _selectedDate.getMonth() + 1;
  }, [_selectedDate]);

  const dateList = useMemo(() => {
    const toDay = new Date();
    const date = [];
    const now = new Date(year, month - 1);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayOfPrevMonth = new Date(firstDayOfMonth);
    lastDayOfPrevMonth.setDate(0);

    /* prevMonth date */
    for (let i = 0; i < firstDayOfMonth.getDay() - FIRST_DATY_OF_WEEK; i++) {
      date.push({
        year: lastDayOfPrevMonth.getFullYear(),
        month: lastDayOfPrevMonth.getMonth() + 1,
        date: lastDayOfPrevMonth.getDate(),
        dark: true,
        spotlight: false,
      });
      lastDayOfPrevMonth.setDate(lastDayOfPrevMonth.getDate() - 1);
    }
    date.reverse();
    /* this month date */
    const lastDate = lastDayOfMonth.getDate();

    for (let i = 0; i < lastDate; i++) {
      const dateStr = HelperMethods.convertDateToString(
        year,
        month,
        firstDayOfMonth.getDate()
      );
      date.push({
        year: year,
        month: month,
        date: firstDayOfMonth.getDate(),
        dark: false,
        history: candyActivities[dateStr],
        spotlight: true,
      });
      let spottable = firstDayOfMonth < toDay;
      if (whitelist && whitelist.length > 0) {
        spottable =
          whitelist.indexOf(
            HelperMethods.convertDateToString2(firstDayOfMonth)
          ) >= 0;
      }

      date.push({
        year: year,
        month: month,
        date: firstDayOfMonth.getDate(),
        dark: false,
        spotlight: spottable, //can only spot before today
        disabled: !spottable,
      });
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }
    /* next month date */
    for (let i = date.length; i < 42; i++) {
      date.push({
        year: firstDayOfMonth.getFullYear(),
        month: firstDayOfMonth.getMonth() + 1,
        date: firstDayOfMonth.getDate(),
        dark: true,
        spotlight: false,
      });
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }
    return date;
  }, [_selectedDate, whitelist, year, month]);

  const onSelectMonth = useCallback(({ first, last, previous }) => {
    console.log("onSelectMonth ", first);
    const date = new Date(first);
    _setSelectedDate(date);
  }, []);

  const onClickSelectDate = useCallback(
    (clickedDateStr) => {
      if (onSelectedDate) {
        onSelectedDate({ selectedDate: clickedDateStr });
      }
      _setSelectedDate(new Date(clickedDateStr));
    },
    [onSelectedDate]
  );

  return (
    <Container className={classNames(css.calendar)}>
      <Container className={css.pickerlayer}>
        <DatePicker
          mode="monthly"
          onSelect={onSelectMonth}
          selectedDate={_selectedDate}
        />
      </Container>
      <Container className={css.dateLayer}>
        <div className={css.weekdays}>
          {WEEKDAYS.map((item, index) => (
            <div key={index} className={css.weekdayItem}>
              {item}
            </div>
          ))}
        </div>
        <div className={css.datelist}>
          {dateList.map((item, index) => (
            <TCalendarItem
              key={"date" + index}
              data={item}
              selectedDateStr={HelperMethods.convertDateToString2(
                _selectedDate
              )}
              onClick={onClickSelectDate}
            />
          ))}
        </div>
      </Container>
    </Container>
  );
};

export default TCalendar;
