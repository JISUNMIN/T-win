import React, { useState, useCallback, useEffect, useMemo } from "react";
import classNames from "classnames";
import Spottable from "@enact/spotlight/Spottable";
import { SpotlightContainerDecorator } from "@enact/spotlight/SpotlightContainerDecorator";
import css from "./TCalendar.module.less";

import DatePicker from "../TDatePicker/DatePicker";
import * as HelperMethods from "../../utils/helperMethods";

const SpottableComponent = Spottable("div");
const Container = SpotlightContainerDecorator(
  { enterTo: "last-focused" },
  "div"
);
// selectedDate: "2022-04-29"

const TCalendarItem = ({ data, selectedDate = "", onClick, ...rest }) => {
  const selected = useMemo(() => {
    const dateStr = HelperMethods.convertDateToString(
      data.year,
      data.month,
      data.date
    );
    return data.spotlight && dateStr === selectedDate;
  }, [data, selectedDate]);

  const _onClick = useCallback(() => {
    if (onClick) {
      onClick(
        HelperMethods.convertDateToString(data.year, data.month, data.date)
      );
    }
  }, [onClick, data]);

  return (
    <SpottableComponent
      {...rest}
      className={classNames(css.calendarItem, selected ? css.selected : null)}
      spotlightDisabled={!data.spotlight}
      onClick={_onClick}
    >
      <div className={classNames(css.title, data.dark ? css.dark : null)}>
        {data.date}
      </div>
    </SpottableComponent>
  );
};

const NOW = new Date();
// TCalendar = ({ className, candyActivities, onChange }) => {}
const TCalendar = ({ onChange, className }) => {
  const [year, setYear] = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth() + 1); //january is 1
  const [selectedDate, setSelectedDate] = useState(
    HelperMethods.convertDateToString(
      NOW.getFullYear(),
      NOW.getMonth() + 1,
      NOW.getDate()
    )
  );

  useEffect(() => {
    if (onChange) {
      onChange(selectedDate);
    }
  }, [selectedDate, onChange]);

  const dateList = useMemo(() => {
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
      let historyCount = 0;
      // date.push({ year: year, month: month, date: firstDayOfMonth.getDate(), dark: false, history: candyActivities[dateStr], spotlight: true });
      date.push({
        year: year,
        month: month,
        date: firstDayOfMonth.getDate(),
        dark: false,
        spotlight: true,
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
    // [year, month, candyActivities]
  }, [year, month]);

  const onSelectMonth = useCallback(
    ({ first, last, previous }) => {
      const date = new Date(first);
      const newYear = date.getFullYear();
      const newMonth = date.getMonth() + 1;
      if (year !== newYear || month !== newMonth) {
        setYear(newYear);
        setMonth(newMonth);
      }
    },
    [year, month]
  );
  const onSelectDate = useCallback((evt) => {
    setSelectedDate(evt);
  }, []);
  return (
    <Container className={classNames(css.calendar, className)}>
      <Container className={css.pickerlayer}>
        <DatePicker mode="monthly" onSelect={onSelectMonth} />
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
              selectedDate={selectedDate}
              onClick={onSelectDate}
            />
          ))}
        </div>
      </Container>
    </Container>
  );
};

export default TCalendar;
