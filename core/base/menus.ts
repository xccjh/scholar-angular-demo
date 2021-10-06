export interface MenuIcon {
    /** Type for icon */
    type: 'class' | 'icon' | 'iconfont' | 'img';
    /** Value for the icon, can be set Class Name, nz-icon of `nzType`, image */
    value?: string;
    /** Type of the ant design icon, default: `outline` */
    theme?: 'outline' | 'twotone' | 'fill';
    /** Rotate icon with animation, default: `false` */
    spin?: boolean;
    /** Only support the two-tone icon. Specific the primary color */
    twoToneColor?: string;
    /** Type of the icon from iconfont */
    iconfont?: string;
  }

export interface Menu {
    text?: string;
    link?: string;
    realLink?: string;
    isSelected?: boolean;
    isOpen?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top';
    /** Icon for the menu item, only valid for the first level menu */
    icon?: string | MenuIcon | null;
    /** Badget for the menu item when `group` is `true` */
    operation?: string;
    /** Whether shortcut menu item */
    seq?: number;
    level?: number;
    /** Wheter shortcut menu root node */
    linkType?: string;
    /** Whether to allow reuse, need to cooperate with the `reuse-tab` component */
    children?: Menu[];
    isVisible?: '0' |'1';
  }
