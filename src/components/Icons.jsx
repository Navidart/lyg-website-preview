import React from "react";
import arrowRightIcon from "../assets/icons/navigation/ico-arrow-right.svg";
import chevronDownIcon from "../assets/icons/navigation/ico-chevron-down.svg";
import crossLargeIcon from "../assets/icons/navigation/ico-cross-large.svg";
import crossSmallIcon from "../assets/icons/navigation/ico-cross-small.svg";
import menuIcon from "../assets/icons/navigation/ico-menu.svg";
import banIcon from "../assets/icons/actions/ico-ban.svg";
import editIcon from "../assets/icons/actions/ico-edit.svg";
import searchIcon from "../assets/icons/actions/ico-search.svg";
import trashIcon from "../assets/icons/actions/ico-trash.svg";
import userIcon from "../assets/icons/system/ico-user.svg";
import googleIcon from "../assets/icons/provider/ico-google.svg";
import globeIcon from "../assets/icons/system/ico-globe.svg";
import shieldIcon from "../assets/icons/status/ico-shield.svg";
import yachtBuyIcon from "../assets/icons/modules/ico-yacht-buy.svg";
import yachtSellIcon from "../assets/icons/modules/ico-yacht-sell.svg";
import charterIcon from "../assets/icons/modules/ico-charter.svg";
import findCrewIcon from "../assets/icons/modules/ico-find-crew.svg";
import findWorkIcon from "../assets/icons/modules/ico-find-wrok.svg";
import estimateIcon from "../assets/icons/modules/ico-estimate.svg";
import medalIcon from "../assets/icons/system/ico-medal.svg";
import supportIcon from "../assets/icons/system/ico-support.svg";
import documentIcon from "../assets/icons/system/ico-document.svg";

const imageIcons = {
  "ico-arrow-right": arrowRightIcon,
  arrowRight: arrowRightIcon,
  "ico-chevron-down": chevronDownIcon,
  chevron: chevronDownIcon,
  "ico-cross-small": crossSmallIcon,
  "ico-cross-large": crossLargeIcon,
  "ico-menu": menuIcon,
  menu: menuIcon,
  "ico-google": googleIcon,
  google: googleIcon,
  "ico-ban": banIcon,
  ban: banIcon,
  "ico-edit": editIcon,
  edit: editIcon,
  "ico-trash": trashIcon,
  delete: trashIcon,
  "ico-user": userIcon,
  user: userIcon,
  "ico-search": searchIcon,
  "ico-yacht-buy": yachtBuyIcon,
  "yacht-buy": yachtBuyIcon,
  yacht: yachtBuyIcon,
  "ico-yacht-sell": yachtSellIcon,
  "yacht-sell": yachtSellIcon,
  sell: yachtSellIcon,
  "ico-charter": charterIcon,
  charter: charterIcon,
  "ico-find-crew": findCrewIcon,
  "find-crew": findCrewIcon,
  crew: findCrewIcon,
  "ico-find-wrok": findWorkIcon,
  "ico-find-work": findWorkIcon,
  "find-work": findWorkIcon,
  work: findWorkIcon,
  "ico-estimate": estimateIcon,
  estimate: estimateIcon,
  calculator: estimateIcon,
  "ico-globe": globeIcon,
  globe: globeIcon,
  "ico-medal": medalIcon,
  medal: medalIcon,
  "ico-support": supportIcon,
  support: supportIcon,
  "ico-document": documentIcon,
  document: documentIcon,
  search: searchIcon,
  shield: shieldIcon,
  "ico-accounting": yachtBuyIcon,
  "ico-nav-sales": yachtBuyIcon,
  "ico-nav-charter": charterIcon,
};

export default function Icon({ name, size = 24, className = "" }) {
  const imageSrc = imageIcons[name];

  if (imageSrc) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          alt=""
          aria-hidden="true"
          className={`svg-icon ${className}`.trim()}
          src={imageSrc}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </span>
    );
  }

  return null;
}
