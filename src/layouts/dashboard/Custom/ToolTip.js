/* eslint-disable react/prop-types */
import React from 'react';
import Tooltip from "@mui/material/Tooltip";

const TruncatedText = ({ text, maxLength = 11 }) => {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.substring(0, maxLength - 3)}...` : text;

  return (
    <Tooltip title={isTruncated ? text : ""} arrow>
      <span>{displayText}</span>
    </Tooltip>
  );
};

export default TruncatedText;