import SvgIcon from '@mui/material/SvgIcon';

export default function SitemarkIcon() {
  return (
    <SvgIcon sx={{ height: 32, width: 32, mr: 2 }}>
      {/* Modern Car Icon SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 7H17.5L18.5 10H5.5L6.5 7ZM19 17H5V12H19V17Z"
          fill="#4876EE"
        />
        <circle cx="7.5" cy="14.5" r="1.5" fill="#4876EE" />
        <circle cx="16.5" cy="14.5" r="1.5" fill="#4876EE" />
      </svg>
    </SvgIcon>
  );
}