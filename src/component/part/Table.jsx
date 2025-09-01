import { FILE_LINK } from "../util/Constants";
import Icon from "./Icon";
import { useEffect, useRef, useState } from "react";
import Modal from "../part/Modal";
import Button from "./Button";
import useMultiRefs from "../util/MultiRef";
import SweetAlert from "../util/SweetAlert";
export default function Table({
  data,
  onToggle = () => {},
  onCancel = () => {},
  onDelete = () => {},
  onDetail = () => {},
  onEdit = () => {},
  onApprove = () => {},
  onDownload = () => {},
  onReject = () => {},
  onSent = () => {},
  enableColumnSearchBox = false,
  setHeaderBoxSearchQuery,
  multiRef,
  addMultiRef,
}) {
  const modalRef = useRef();
  const [currentItem, setCurrentItem] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  let colPosition;
  let colCount = 0;

  const handleToggleClick = (id, status, Stok, partNumber) => {
    if (Stok > 0 && status === "Aktif") {
      SweetAlert(
        "Peringatan",
        "Tidak bisa menonaktifkan data karena stok tidak kosong",
        "warning"
      );
      return;
    }
    setCurrentItem({ id, status, Stok, partNumber });
    const message =
      status === "Aktif"
        ? "Yakin ingin menonaktifkan data?"
        : "Yakin ingin mengaktifkan data?";
    setModalMessage(message);
    modalRef.current.open();
  };

  const handleDownloadExcelClick = (no) => {
    onDownload(no);
  };

  const handleConfirmToggle = () => {
    // console.log(currentItem)
    if (currentItem) {
      onToggle(currentItem.partNumber);
    }
    modalRef.current.close();
    setCurrentItem(null);
  };

  const handleCancelToggle = () => {
    modalRef.current.close();
    setCurrentItem(null);
  };

  const handleHeaderBoxSearchQuery = (e) => {
    if (e.key === "Enter") {
      let columnName = e.target.name;
      if (columnName === "Nama Barang") {
        columnName = "Nama Material";
      } else if (columnName === "Stok Minimal") {
        columnName = "Stock Minimal";
      } else if (columnName === "Jumlah Stok") {
        columnName = "Stock Tersedia";
      }
      setHeaderBoxSearchQuery({
        column: `[${columnName}]`,
        value: e.target.value,
      });
    }
  };

  useEffect(() => {
    if (multiRef === undefined) return;
    const refElements = multiRef();
    if (refElements.length === 0) return;
    refElements.forEach((element) => {
      element.addEventListener("keyup", handleHeaderBoxSearchQuery);
    });
  }, []);

  function generateActionButton(columnName, value, key, id, status, Stok, no, partNumber) {
    if (columnName !== "Aksi" && columnName !== "Foto") return value;
    const path = window.location.pathname;
    if (columnName === "Foto") {
      return (
        value && (
          <img
            key={key + columnName}
            src={FILE_LINK + value}
            alt="Foto"
            style={{ width: "100px", height: "auto" }}
          />
        )
      );
    }

    const listButton = value.map((action) => {
      switch (action) {
        case "Toggle":
          if (path === "/master_material") {
            if (status === "Aktif") {
              return (
                <Icon
                  key={key + action}
                  name="toggle-on"
                  type="Bold"
                  cssClass="btn px-1 py-0 text-primary"
                  title="Nonaktifkan"
                  onClick={() => handleToggleClick(id, status, Stok, partNumber)}
                />
              );
            } else if (status === "Non Aktif") {
              return (
                <Icon
                  key={key + action}
                  name="toggle-off"
                  type="Bold"
                  cssClass="btn px-1 py-0 text-secondary"
                  title="Aktifkan"
                  onClick={() => handleToggleClick(id, status, Stok, partNumber)}
                />
              );
            }
          }
          break;
        case "Cancel":
          return (
            <Icon
              key={key + action}
              name="delete-document"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Batalkan"
              onClick={onCancel}
            />
          );
        case "Delete":
          return (
            <Icon
              key={key + action}
              name="trash"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Hapus"
              onClick={() => onDelete(id)}
            />
          );
        case "Detail":
          return (
            <Icon
              key={key + action}
              name="overview"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Lihat Detail"
              onClick={() => onDetail("detail", id)}
            />
          );
        case "Edit":
          return (
            <Icon
              key={key + action}
              name="edit"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Ubah"
              onClick={() => {
                // console.log("Sending ID to edit:", partNumber); // Debugging
                onEdit("edit",partNumber);
              }}
              //onClick={() => onEdit("edit", id)}
            />
          );
        case "Approve":
          return (
            <Icon
              key={key + action}
              name="check"
              type="Bold"
              cssClass="btn px-1 py-0 text-success"
              title="Setujui Pengajuan"
              onClick={onApprove}
            />
          );
        case "Reject":
          return (
            <Icon
              key={key + action}
              name="cross"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Tolak Pengajuan"
              onClick={onReject}
            />
          );
        case "Sent":
          return (
            <Icon
              key={key + action}
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim"
              onClick={onSent}
            />
          );
        case "Excel":
          return (
            <Icon
              key={key + action}
              name="download"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Unduh"
              onClick={() => handleDownloadExcelClick(no)}
            />
          );
        default:
          return null;
      }
    });

    return listButton;
  }

  return (
    <div className="flex-fill">
      <table className="table table-hover table-striped table table-light border">
        <thead>
          <tr>
            {Object.keys(data[0]).map((value, index) => {
              if (
                value !== "Key" &&
                value !== "Count" &&
                value !== "Alignment" &&
                value !== "ColumnSize"
              ) {
                colCount++;
                return (
                  <th
                    key={"Header" + index}
                    className="text-center"
                    style={{ height: "100%", verticalAlign: "top" }}
                  >
                    <div
                      className="flex flex-column"
                      style={{ alignItems: "flex-start", height: "100%" }}
                    >
                      <div>{value}</div>
                      {enableColumnSearchBox &&
                      value !== "Aksi" &&
                      value !== "No" ? (
                        <input
                          type="text"
                          className="form-control mt-2"
                          ref={addMultiRef}
                          name={value}
                        />
                      ) : null}
                    </div>
                  </th>
                );
              }
            })}
          </tr>
        </thead>
       <tbody>
  {data[0]?.Count !== 0 &&
    data.map((value, rowIndex) => {
      let colPosition = -1;
      return (
        <tr
          key={value["Key"]}
          className={
            value["Status"] && value["Status"] === "Draft"
              ? "fw-bold"
              : undefined
          }
        >
          {Object.keys(value).map((column, colIndex) => {
            if (
              column !== "Key" &&
              column !== "Count" &&
              column !== "Alignment" &&
              column !== "ColumnSize"
            ) {
              colPosition++;
              
              // Check if the column contains image data
              const cellValue = value[column];
              const isImageColumn = column.toLowerCase().includes('gambar') || 
                                  column.toLowerCase().includes('image') ||
                                  column.toLowerCase().includes('foto') ||
                                  column.toLowerCase().includes('picture');
              
              return (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    textAlign: value["Alignment"]?.[colPosition] || 'left',
                    width: value["ColumnSize"]?.[colPosition],
                  }}
                >
                  {isImageColumn && cellValue ? (
                    <img 
                      src={`${FILE_LINK}${cellValue}`}
                      alt={`${column} for ${value["Key"]}`}
                      style={{
                        maxWidth: '100px',
                        maxHeight: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    generateActionButton(
                      column,
                      cellValue,
                      `Action${rowIndex}${colIndex}`,
                      value["Key"],
                      value["Status"],
                      value["Stok"],
                      value["No. Surat Jalan"],
                      value['Part Number']
                    )
                  )}
                  
                  {isImageColumn && (
                    <span 
                      style={{ display: 'none' }}
                      className="text-muted"
                    >
                      No image
                    </span>
                  )}
                </td>
              );
            }
            return null;
          })}
        </tr>
      );
    })}
  
  {(!data || data.length === 0 || data[0]?.Count === 0) && (
    <tr>
      <td colSpan={colCount} className="text-center">
        Tidak ada data.
      </td>
    </tr>
  )}
</tbody>
      </table>

      <Modal
        ref={modalRef}
        title="Konfirmasi"
        size="small"
        Button1={
          <Button
            classType="danger me-1"
            label="Ya"
            onClick={handleConfirmToggle}
          />
        }
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
}
