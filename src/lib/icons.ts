import { Laptop, Cpu, Monitor, Speaker, Component, Gamepad2, Printer, Camera, HardDrive, Tv, ShoppingBag, Github, Twitter, Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const icons = {
    Laptop,
    Cpu,
    Monitor,
    Speaker,
    Component,
    Gamepad2,
    Printer,
    Camera,
    HardDrive,
    Tv,
    ShoppingBag,
    Github,
    Twitter,
    Facebook,
    Youtube,
    Instagram,
    Mail,
    Phone,
    MapPin
};

export type IconName = keyof typeof icons;

export function getIcon(name: IconName | string | undefined): React.ElementType | null {
    if (!name || !(name in icons)) return null;
    return icons[name as IconName];
}
