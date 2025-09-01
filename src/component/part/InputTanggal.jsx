import React, { forwardRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button';

const InputTanggal = forwardRef(function InputTanggal(
  {
    label = "",
    forInput,
    type = "text",
    placeholder = "",
    isRequired = false,
    errorMessage,
    ...props
  },
  ref
) {
  const [startDate, setStartDate] = useState(null);

  return (
    <>
      {label !== "" && (
        <div className="mb-3">
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            ) : (
              ""
            )}
          </label>
          {type === "textarea" && (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              {...props}
            ></textarea>
          )}
          {type !== "textarea" && (
            <div className="input-group">
              {type === "date" ? (
                <ReactDatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="form-control"
                  placeholderText={placeholder}
                  ref={ref}
                  {...props}
                />
              ) : (
                <input
                  id={forInput}
                  name={forInput}
                  type={type}
                  className="form-control"
                  placeholder={placeholder}
                  ref={ref}
                  {...props}
                />
              )}
              <Button
                iconName="date"
                classType="primary px-4"
                title="Cari"
              />
            </div>
          )}
        </div>
      )}
      {label === "" && (
        <>
          {type === "textarea" && (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              {...props}
            ></textarea>
          )}
          {type !== "textarea" && (
            <div className="input-group">
              {type === "date" ? (
                <ReactDatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="form-control"
                  placeholderText={placeholder}
                  ref={ref}
                  {...props}
                />
              ) : (
                <input
                  id={forInput}
                  name={forInput}
                  type={type}
                  className="form-control"
                  placeholder={placeholder}
                  ref={ref}
                  {...props}
                />
              )}
              <Button
                iconName="date"
                classType="primary px-4"
                title="Cari"
              />
            </div>
          )}
          {errorMessage ? (
            <span className="small ms-1 text-danger">
              {placeholder.charAt(0).toUpperCase() +
                placeholder.substr(1).toLowerCase() +
                " " +
                errorMessage}
            </span>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
});

export default InputTanggal;
