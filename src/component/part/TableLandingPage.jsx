import { useEffect, useRef, useState } from "react";
export default function Table({
  data,
  enableColumnSearchBox = false,
  multiRef,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQueries, setSearchQueries] = useState({});
  const [currentPage, setCurrentPage] = useState(data.length > 0 ? 1 : 0); // State for current page
  const PAGE_SIZE = 10; // Define the number of items per page
  const MAX_PAGES_DISPLAY = 10; // Define the maximum number of page buttons to display

  let colPosition;
  let colCount = 0;

  const handleHeaderBoxSearchQuery = (e) => {
    const { name, value } = e.target;
    setSearchQueries((prevQueries) => ({
      ...prevQueries,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when searching
  };

  const filteredData = data.filter((row) => {
    return Object.keys(searchQueries).every((column) => {
      if (!searchQueries[column]) return true;
      const cellValue = row[column];
      return cellValue
        .toString()
        .toLowerCase()
        .includes(searchQueries[column].toLowerCase());
    });
  });

  useEffect(() => {
    if (multiRef === undefined) return;
    const refElements = multiRef();
    if (refElements.length === 0) return;
    refElements.forEach((element) => {
      element.addEventListener("keyup", handleHeaderBoxSearchQuery);
    });
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const generateActionButton = (value) => {
    return value;
  };

  const sortedData = sortConfig.key
    ? [...filteredData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      })
    : filteredData;

  // Add the No column to the sorted data
  const paginatedData = sortedData
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    .map((row, index) => ({
      ...row,
      No: (currentPage - 1) * PAGE_SIZE + index + 1,
    }));

  const handleNextPage = () => {
    if (currentPage < Math.ceil(sortedData.length / PAGE_SIZE)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getDisplayedPages = () => {
    const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
    const startPage = Math.max(
      Math.min(
        currentPage - Math.floor(MAX_PAGES_DISPLAY / 2),
        totalPages - MAX_PAGES_DISPLAY + 1
      ),
      1
    );
    const endPage = Math.min(startPage + MAX_PAGES_DISPLAY - 1, totalPages);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="flex-fill table-responsive">
      <table className="table table-hover table-striped table table-light border">
        <thead>
          <tr>
            <th
              className="text-center"
              style={{ height: "100%", verticalAlign: "top" }}
            >
              <div
                className="flex flex-column"
                style={{ alignItems: "flex-start", height: "100%" }}
              >
                <span>No</span>
              </div>
            </th>
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
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{value}</span>
                        <button
                          onClick={() => handleSort(value)}
                          className="btn btn-link"
                        >
                          {sortConfig.key === value ? (
                            sortConfig.direction === "asc" ? (
                              <i className="fas fa-sort-up ms-2"></i>
                            ) : (
                              <i className="fas fa-sort-down ms-2"></i>
                            )
                          ) : (
                            <i className="fas fa-sort ms-2"></i>
                          )}
                        </button>
                      </div>
                      {enableColumnSearchBox && (
                        <input
                          className="form-control mt-2"
                          key={"SearchBox" + index}
                          type="text"
                          name={value}
                          onChange={handleHeaderBoxSearchQuery}
                          placeholder={`Cari ${value}`}
                        />
                      )}
                    </div>
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={colCount + 1} className="text-center">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            paginatedData.map((value, rowIndex) => {
              colPosition = -1;
              return (
                <tr
                  key={value["Key"]}
                  className={
                    value["Status"] && value["Status"] === "Draft"
                      ? "fw-bold"
                      : undefined
                  }
                >
                  <td className="text-center">{value["No"]}</td>
                  {Object.keys(value).map((column, colIndex) => {
                    if (
                      column !== "Key" &&
                      column !== "Count" &&
                      column !== "Alignment" &&
                      column !== "ColumnSize" &&
                      column !== "No"
                    ) {
                      colPosition++;
                      return (
                        <td
                          key={rowIndex + "" + colIndex}
                          style={{
                            textAlign: value["Alignment"]
                              ? value["Alignment"][colPosition]
                              : "left",
                            width: value["ColumnSize"]
                              ? value["ColumnSize"][colPosition]
                              : "auto",
                          }}
                        >
                          {generateActionButton(value[column])}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {paginatedData.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="btn btn-primary"
            style={{ margin: "0 5px" }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {getDisplayedPages().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`btn ${
                page === currentPage ? "btn-secondary" : "btn-light"
              }`}
              style={{ margin: "0 5px" }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(sortedData.length / PAGE_SIZE)}
            className="btn btn-primary"
            style={{ margin: "0 5px" }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
