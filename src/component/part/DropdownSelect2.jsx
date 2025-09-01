import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";

const DropDownSelect2 = React.forwardRef(function DropDownSelect2(
  {
    arrData,
    type = "pilih",
    label = "",
    forInput,
    isRequired = false,
    errorMessage,
    showLabel = true,
    ...props
  },
  ref
) {
  const selectRef = useRef(null);

  useEffect(() => {
    $(selectRef.current).select2();

    return () => {
      $(selectRef.current).select2('destroy');
    };
  }, []);

  let placeholder = "";

  switch (type) {
    case "pilih":
      placeholder = <option value="">{"-- Pilih " + label + " --"}</option>;
      break;
    case "semua":
      placeholder = <option value="">-- Semua --</option>;
      break;
    default:
      break;
  }

  return (
    <div className="mb-3">
      {showLabel && (
        <label htmlFor={forInput} className="form-label fw-bold">
          {label}
          {isRequired ? <span className="text-danger"> *</span> : ""}
          {errorMessage ? (
            <span className="fw-normal text-danger"> {errorMessage}</span>
          ) : (
            ""
          )}
        </label>
      )}
      <div className="d-flex align-items-center">
        <select
          className="form-select"
          id={forInput}
          name={forInput}
          ref={selectRef}
          {...props}
        >
          {placeholder}
          {arrData &&
            arrData.length > 0 &&
            arrData.map((data) => {
              return (
                <option key={data.Value} value={data.Value}>
                  {data.Text}
                </option>
              );
            })}
        </select>
        <FontAwesomeIcon icon={faSearch} className="ms-2" />
      </div>
    </div>
  );
});

export default DropDownSelect2;
