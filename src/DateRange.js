import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import parseInput from './utils/parseInput.js';
import Calendar from './Calendar.js';
import PredefinedRanges from './PredefinedRanges.js';
import getTheme, { defaultClasses } from './styles.js';

class DateRange extends Component {

  constructor(props, context) {
    super(props, context);

    const { format, linkedCalendars, theme } = props;

    const startDate = parseInput(props.startDate, format, 'startOf');
    const endDate   = parseInput(props.endDate, format, 'endOf');

    this.state = {
      range     : { startDate, endDate },
      link      : linkedCalendars && endDate,
    }

    this.step = 0;
    this.styles = getTheme(theme);
  }

  componentDidMount() {
    const { onInit } = this.props;
    onInit && onInit(this.state.range);
  }

  orderRange(range) {
    const { startDate, endDate } = range;
    const swap = startDate.isAfter(endDate);

    if (!swap) return range;

    return {
      startDate : endDate,
      endDate   : startDate
    }
  }

  setRange(range, source) {
    const { onChange } = this.props
    range = this.orderRange(range);

    this.setState({
      range: range,
      link: this.props.linkedCalendars && range.endDate
    });

    onChange && onChange(range, source);
  }

  handleSelect(date, source) {
    if (date.startDate && date.endDate) {
      this.step = 0;
      return this.setRange(date, source);
    }

    const { startDate, endDate } = this.state.range;

    const range = {
      startDate : startDate,
      endDate   : endDate
    };

    if ( date.isBefore(range.startDate) ) {
      this.step = 0;
    }

    switch (this.step) {
      case 0:
        range['startDate'] = date;
        range['endDate'] = date;
        this.step = 1;
        break;

      case 1:
        range['endDate'] = date;
        this.step = 0;
        break;
    }

    this.setRange(range, source);
  }

  handleLinkChange(direction) {
    const { link } = this.state;

    this.setState({
      link : link.clone().add(direction, 'months')
    });
  }

  componentWillReceiveProps(newProps) {
    // Whenever date props changes, update state with parsed variant
    if (newProps.startDate || newProps.endDate) {
      const format       = newProps.format || this.props.format;
      const startDate    = newProps.startDate   && parseInput(newProps.startDate, format, 'startOf');
      const endDate      = newProps.endDate     && parseInput(newProps.endDate, format, 'endOf');
      const oldStartDate = this.props.startDate && parseInput(this.props.startDate, format, 'startOf');
      const oldEndDate   = this.props.endDate   && parseInput(this.props.endDate, format, 'endOf');

      if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
        this.setRange({
          startDate: startDate || oldStartDate,
          endDate: endDate || oldEndDate
        });
      }
    }
  }

  render() {
    const { ranges, format, linkedCalendars, style, calendars, firstDayOfWeek, minDate, maxDate, classNames, onlyClasses, lang, disableDaysBeforeToday, offsetPositive, shownDate, showMonthArrow } = this.props;
    const { range, link } = this.state;
    const { styles } = this;

    const classes = { ...defaultClasses, ...classNames };

    return (
      <div style={onlyClasses ? undefined : { ...styles['DateRange'], ...style }} className={classes.dateRange}>
        { ranges && (
          <PredefinedRanges
            format={ format }
            ranges={ ranges }
            range={ range }
            theme={ styles }
            onSelect={this.handleSelect.bind(this)}
            onlyClasses={ onlyClasses }
            classNames={ classes } />
        )}

        {()=>{
          const _calendars = [];
          const _method = offsetPositive ? 'unshift' : 'push';
          for (var i = Number(calendars) - 1; i >= 0; i--) {
            var isInterior = (i != 0 && Number(calendars))
            _calendars[_method](
              <Calendar
                showPrevMonthArrow={ linkedCalendars ? showMonthArrow && ( i === Number(calendars)-1) : showMonthArrow }
                showNextMonthArrow={ linkedCalendars ? showMonthArrow && ( i ===  0) : showMonthArrow }
                shownDate={ shownDate }
                disableDaysBeforeToday={ disableDaysBeforeToday }
                lang={ lang }
                key={i}
                offset={ offsetPositive ? i : -i }
                link={ linkedCalendars && link }
                linkCB={ this.handleLinkChange.bind(this) }
                range={ range }
                format={ format }
                firstDayOfWeek={ firstDayOfWeek }
                theme={ styles }
                minDate={ minDate }
                maxDate={ maxDate }
		            onlyClasses={ onlyClasses }
                classNames={ classes }
                onChange={ this.handleSelect.bind(this) }  />
            );
          }
          return _calendars;
        }()}
      </div>
    );
  }
}

DateRange.defaultProps = {
  linkedCalendars : false,
  theme           : {},
  format          : 'DD/MM/YYYY',
  calendars       : 2,
  onlyClasses     : false,
  offsetPositive  : false,
  classNames      : {},
  showMonthArrow  : true
}

DateRange.propTypes = {
  format          : PropTypes.string,
  firstDayOfWeek  : PropTypes.number,
  calendars       : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate       : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  endDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  minDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  dateLimit       : PropTypes.func,
  ranges          : PropTypes.object,
  linkedCalendars : PropTypes.bool,
  theme           : PropTypes.object,
  onInit          : PropTypes.func,
  onChange        : PropTypes.func,
  onlyClasses     : PropTypes.bool,
  offsetPositive  : PropTypes.bool,
  classNames      : PropTypes.object
}

export default DateRange;
