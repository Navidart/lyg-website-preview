import React from "react";

export default function DropdownMenu({ items }) {
  return (
    <div className="dropdown" role="menu">
      {items.map((item) => (
        <a href="#" role="menuitem" key={item}>
          {item}
        </a>
      ))}
    </div>
  );
}
