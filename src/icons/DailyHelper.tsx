import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'

export default function DailyHelper(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 330 330">
        <rect x="0" y="30" width="330" height="300" rx="25" ry="25" />
        <rect x="30" y="105" width="270" height="195" fill="#1976d2" />
        <g>
          <rect x="50" width="30" height="31" />
        </g>
        <rect width="30" height="31" x="250" />
        <circle cx="120" cy="145" r="30" />
        <circle cx="210" cy="250" r="30" />
        <rect x="115" y="174" width="10" height="47" />
        <rect x="205" y="149" width="10" height="72" />
        <path d="M 180 140 H 210 A 5 5 0 0 1 215 145 V 150 H 180 A 5 5 0 0 1 175 145 V 145 A 5 5 0 0 1 180 140 Z" />
        <rect x="201" y="149" width="5" height="5" />
        <path
          fill="#1976d2"
          d="M 195 150 H 201 A 4 4 0 0 1 205 154 V 160 H 195 V 150 Z"
        />
        <circle cx="120" cy="250" r="30" />
        <circle fill="#1976d2" cx="120" cy="145" r="15" />
        <circle fill="#1976d2" cx="120" cy="250" r="15" />
        <circle fill="#1976d2" cx="210" cy="250" r="15" />
      </svg>
    </SvgIcon>
  )
}
