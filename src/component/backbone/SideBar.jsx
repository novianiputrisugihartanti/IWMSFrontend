import Menu from "./Menu";

export default function SideBar({ listMenu }) {
  return (
    <div className="position-relative overflow-visible">
      <div id="sidebar" className="border-end position-fixed h-100 pt-2 overflow-y-auto overflow-x-auto sidebarMenu">
        <Menu listMenu={listMenu} />
      </div>
    </div>
  );
}
