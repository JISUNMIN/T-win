/**
 * DatePicker
 *
 * @module DatePicker
 */
import classNames from "classnames";
import { Job } from "@enact/core/util";
import React, { useState, useCallback, useEffect } from "react";
import { SpotlightContainerDecorator } from "@enact/spotlight/SpotlightContainerDecorator";
import Button from "@enact/sandstone/Button";
import css from "./DatePicker.module.less";
import * as helperMethods from "../../utils/helperMethods";

const Container = SpotlightContainerDecorator({ restrict: "self-only" }, "div");

/*
	mode : total, quarterly, monthly, weekly
*/
const DatePicker = ({ mode, onSelect, selectedDate }) => {
  const [moving, setMoving] = useState("");
  const [items, setItems] = useState([]);
  const [itemStrs, setItemStrs] = useState([]);
  const appStatus = {
    language: "ko",
  };

  const makeData = (_mode, language, date) => {
    let resultDateStr = "",
      firstday = "";
    if (_mode === "weekly") {
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
    } else if (_mode === "monthly") {
      const today = new Date(date);
      resultDateStr = today.toLocaleDateString("default", {
        year: "numeric",
        month: "long",
      });
      firstday = today;
    } else if (_mode === "yearly") {
      const today = new Date(date);
      resultDateStr = today.toLocaleDateString("default", { year: "numeric" });
      firstday = today;
    }
    return { firstday: firstday, showingStr: resultDateStr };
  };

  const updateItems = useCallback(
    (base) => {
      const today = base ? new Date(base) : new Date(selectedDate);
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);

      if (mode === "monthly") {
        today.setDate(1);
      } else if (mode === "yearly") {
        today.setDate(1);
        today.setMonth(0);
      }
      const _items = [],
        _itemStrs = [];
      for (let i = 0; i < 3; i++) {
        let res, gap;
        if (mode === "weekly") {
          gap = i === 0 ? -7 : 7;
          res = makeData(
            mode,
            appStatus.language,
            today.setDate(today.getDate() + gap)
          );
        } else if (mode === "monthly") {
          gap = i === 0 ? -1 : 1;
          res = makeData(
            mode,
            appStatus.language,
            today.setMonth(today.getMonth() + gap)
          );
        } else if (mode === "yearly") {
          gap = i === 0 ? -1 : 1;
          res = makeData(
            mode,
            appStatus.language,
            today.setYear(today.getFullYear() + gap)
          );
        }
        _items.push(res.firstday);
        _itemStrs.push(res.showingStr);
      }

      if (itemStrs.toString() !== _itemStrs.toString()) {
        if (onSelect) {
          const d = new Date(_items[2]);
          d.setDate(d.getDate() - 1);
          const lastDateStr = helperMethods.timeToISO8601DateStr(d);
          onSelect({
            first: helperMethods.timeToISO8601DateStr(_items[1]),
            last: lastDateStr,
            previous: helperMethods.timeToISO8601DateStr(_items[0]),
          });
        }
        setItems(_items);
        setItemStrs(_itemStrs);
      }
    },
    [mode, appStatus, onSelect, itemStrs]
  );
  useEffect(() => {
    updateItems(selectedDate);
  }, []);

  useEffect(() => {
    if (moving) {
      removeMovingJob.start();
    }
  }, [moving]);

  const removeMoving = useCallback(() => {
    if (moving === "inc") {
      updateItems(items[2]);
    } else {
      updateItems(items[0]);
    }
    setMoving("");
  }, [moving, items, updateItems]);

  const onClickDec = useCallback(() => {
    if (moving) {
      removeMoving();
    }
    setTimeout(() => {
      setMoving("dec");
    }, 0);
  }, [moving, removeMoving]);

  const onClickInc = useCallback(() => {
    if (moving) {
      removeMoving();
    }
    setTimeout(() => {
      setMoving("inc");
    }, 0);
  }, [moving, removeMoving]);

  const removeMovingJob = new Job(removeMoving, 300);

  return (
    <Container className={css.datePicker}>
      <Button
        icon="arrowlargeleft"
        className={css.button}
        iconPosition="before"
        onClick={onClickDec}
        size="small"
      />
      <div className={css.textLayer}>
        <div className={classNames(css.text, moving ? css[moving] : null)}>
          {itemStrs[0]}
        </div>
        <div className={classNames(css.text, moving ? css[moving] : null)}>
          {itemStrs[1]}
        </div>
        <div className={classNames(css.text, moving ? css[moving] : null)}>
          {itemStrs[2]}
        </div>
      </div>
      <Button
        icon="arrowlargeright"
        className={css.button}
        iconPosition="before"
        onClick={onClickInc}
        size="small"
      />
    </Container>
  );
};

export default DatePicker;
