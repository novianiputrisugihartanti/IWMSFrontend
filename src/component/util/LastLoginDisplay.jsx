import React from 'react';
import Cookies from 'js-cookie';
import { decryptId } from './Encryptor';

function getLastLogin() {
  const encryptedUser = Cookies.get("activeUser");
  if (!encryptedUser) return null;

  const user = JSON.parse(decryptId(encryptedUser));
  return user.lastLogin;
}

function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZoneName: 'short', 
    timeZone: 'Asia/Jakarta' 
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

export default function LastLoginDisplay() {
  const lastLogin = getLastLogin();
  if (!lastLogin) return <p>Login terakhir: -</p>;

  const formattedDate = formatDate(lastLogin);
  return <p>Login terakhir: {formattedDate}</p>;
}