import swal from "sweetalert";

const SweetAlert = (title, text, icon) => {
  swal({
    title: title,
    text: text,
    icon: icon,
  });
};

export default SweetAlert;
