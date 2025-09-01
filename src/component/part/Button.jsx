import Icon from "./Icon";

export default function Button({
  classType,
  iconName,
  label = "",
  title = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={"btn btn-" + classType}
      {...props}
      title={title}
    >
      {iconName && (
        <Icon name={iconName} cssClass={label === "" ? undefined : "pe-2"} />
      )}
      {label}
    </button>
  );
}
