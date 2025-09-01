// import { forwardRef } from "react";

// const DropDown = forwardRef(function DropDown(
//   {
//     arrData,
//     type = "pilih",
//     label = "",
//     forInput,
//     isRequired = false,
//     errorMessage,
//     showLabel = true,
//     ...props
//   },
//   ref
// ) {
//   let placeholder = "";

//   switch (type) {
//     case "pilih":
//       placeholder = <option value="">{"-- Pilih " + label + " --"}</option>;
//       break;
//     case "semua":
//       placeholder = <option value="">-- Semua --</option>;
//       break;
//     default:
//       break;
//   }

//   return (
//     <>
//       <div className="mb-3">
//         {showLabel && (
//           <label htmlFor={forInput} className="form-label fw-bold">
//             {label}
//             {isRequired ? <span className="text-danger"> *</span> : ""}
//             {errorMessage ? (
//               <span className="fw-normal text-danger"> {errorMessage}</span>
//             ) : (
//               ""
//             )}
//           </label>
//         )}
//         <select
//           className="form-select"
//           id={forInput}
//           name={forInput}
//           ref={ref}
//           {...props}
//         >
//           {placeholder}
//           {arrData &&
//             arrData.length > 0 &&
//             arrData.map((data) => {
//               return (
//                 <option key={data.Value} value={data.Value}>
//                   {data.Text}
//                 </option>
//               );
//             })}
//         </select>
//       </div>
//     </>
//   );
// });

// export default DropDown;

import { forwardRef } from "react";

const DropDown = forwardRef(function DropDown(
  {
    arrData,
    type = "pilih",
    label = "",
    forInput,
    isRequired = false,
    errorMessage,
    showLabel = true,
    onChange,
    ...props
  },
  ref
) {
  let placeholder = null;

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

  // Bungkus event agar hanya value yg dikirim
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-3 text-black">
      {showLabel && (
        <label htmlFor={forInput} className="form-label fw-bold">
          {label}
          {isRequired && <span className="text-danger"> *</span>}
          {errorMessage && (
            <span className="fw-normal text-danger"> {errorMessage}</span>
          )}
        </label>
      )}
      <select
        className="form-select text-black"
        id={forInput}
        name={forInput}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {placeholder}
        {arrData &&
          arrData.length > 0 &&
          arrData.map((data, index) => (
            <option key={data.value || index} value={data.value}>
              {data.label}
            </option>
          ))}
      </select>
    </div>
  );
});

export default DropDown;

