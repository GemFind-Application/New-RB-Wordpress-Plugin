import PropTypes from "prop-types";
import "./calendar.css";

const Calendar = ({ className = "", onClose }) => {
  return (
    <div className={`calendar ${className}`}>
      <div className="lr">
        <div className="day-header">
          <img
            className="week-days-icon"
            loading="lazy"
            alt=""
            src="/vector-21.svg"
          />
        </div>
        <h3 className="january">January</h3>
        <div className="day-header1">
          <img
            className="day-header-child"
            loading="lazy"
            alt=""
            src="/vector-21.svg"
          />
        </div>
      </div>
      <section className="month">
        <div className="top5">
          <div className="week">
            <div className="date">
              <b className="mo">MO</b>
            </div>
            <div className="date1">
              <b className="tu">TU</b>
            </div>
            <div className="date">
              <b className="mo">WE</b>
            </div>
            <div className="date1">
              <b className="tu">TH</b>
            </div>
            <div className="date1">
              <a className="fr">FR</a>
            </div>
            <div className="date1">
              <a className="sa">SA</a>
            </div>
            <div className="date6">
              <b className="su">SU</b>
            </div>
          </div>
        </div>
        <div className="list1">
          <div className="event-rows">
            <div className="events">1</div>
          </div>
          <div className="event-rows1">
            <a className="a1">2</a>
          </div>
          <div className="event-rows2">
            <div className="div8">3</div>
          </div>
          <div className="event-rows1">
            <a className="a1">4</a>
          </div>
          <div className="event-rows1">
            <div className="div9">5</div>
          </div>
          <div className="event-rows1">
            <div className="div9">6</div>
          </div>
          <div className="event-rows2">
            <div className="div8">7</div>
          </div>
          <div className="event-rows1">
            <div className="div9">8</div>
          </div>
          <div className="event-rows1">
            <a className="a1">9</a>
          </div>
          <div className="event-rows9">
            <a className="a4">10</a>
          </div>
          <div className="event-rows10">
            <div className="div13">11</div>
          </div>
          <div className="event-rows11">
            <div className="div14">12</div>
          </div>
          <div className="event-rows11">
            <a className="a5">13</a>
          </div>
          <div className="event-rows9">
            <a className="a4">14</a>
          </div>
          <div className="event-rows11">
            <div className="div14">15</div>
          </div>
          <div className="event-rows9">
            <div className="div16">16</div>
          </div>
          <div className="event-rows16">
            <div className="div17">17</div>
          </div>
          <div className="event-rows11">
            <div className="div14">18</div>
          </div>
          <div className="event-rows18">
            <b className="b5">19</b>
          </div>
          <div className="event-rows19">
            <div className="div19">20</div>
          </div>
          <div className="event-rows11">
            <div className="div14">21</div>
          </div>
          <div className="event-rows19">
            <div className="div19">22</div>
          </div>
          <div className="event-rows22">
            <div className="div22">23</div>
          </div>
          <div className="event-rows19">
            <div className="div19">24</div>
          </div>
          <div className="event-rows19">
            <div className="div19">25</div>
          </div>
          <div className="event-rows19">
            <div className="div19">26</div>
          </div>
          <div className="event-rows22">
            <div className="div22">27</div>
          </div>
          <div className="event-rows19">
            <div className="div19">28</div>
          </div>
          <div className="event-rows19">
            <div className="div19">29</div>
          </div>
          <div className="event-rows19">
            <div className="div19">30</div>
          </div>
          <div className="event-rows30">
            <div className="div30">31</div>
          </div>
        </div>
      </section>
    </div>
  );
};

Calendar.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default Calendar;
