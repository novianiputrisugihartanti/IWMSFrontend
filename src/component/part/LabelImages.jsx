import { FILE_LINK } from "../util/Constants";

export default function LabelImages({ title, image, data, forLabel }) {
  console.log("data", image);
  return (
    <>
      <div className="mb-3">
        <label htmlFor={forLabel} className="form-label fw-bold">
          {title}
        </label>
        {image && image?.trim()?.length > 0 ? (
          <>
            <br />
            <img src={data.props.href} alt="Foto" style={{ width: '100px', height: 'auto' }} />
            <br />
            <span style={{ whiteSpace: "pre-wrap" }}>{data}</span>
          </>
        ) : null}
      </div>
    </>
  );
}
