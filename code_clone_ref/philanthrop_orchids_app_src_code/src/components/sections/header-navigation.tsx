"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Grid, Search, ChevronDown } from 'lucide-react';

const navItems = [
    { 
        name: 'Home', 
        href: '#',
        dropdown: [
            { name: 'Charity', href: 'https://demo.artureanec.com/themes/philantrop/' },
            { name: 'Nonprofit', href: 'https://demo.artureanec.com/themes/philantrop/home-save-philantrop/' },
            { name: 'Volunteers', href: 'https://demo.artureanec.com/themes/philantrop/volunteers/' },
            { name: 'Children care', href: 'https://demo.artureanec.com/themes/philantrop/home-children/' },
            { name: 'Protect animals', href: 'https://demo.artureanec.com/themes/philantrop/home-animals/' },
            { name: 'Ocean pollution', href: 'https://demo.artureanec.com/themes/philantrop/ocean/' },
            { name: 'Intro', href: 'https://demo.artureanec.com/themes/philantrop/intro/' },
        ]
    },
    { 
        name: 'Pages', 
        href: '#',
        dropdown: [
            { name: 'About', href: 'https://demo.artureanec.com/themes/philantrop/about-us/' },
            { name: 'Volunteers team', href: 'https://demo.artureanec.com/themes/philantrop/volunteers-team/' },
            { name: 'Become a volunteer', href: 'https://demo.artureanec.com/themes/philantrop/become-a-volunteer/' },
            { name: 'Services', href: 'https://demo.artureanec.com/themes/philantrop/services/' },
            { name: 'Sponsors', href: 'https://demo.artureanec.com/themes/philantrop/sponsors/' },
            { name: 'Projects', href: 'https://demo.artureanec.com/themes/philantrop/projects/' },
            { name: 'FAQ', href: 'https://demo.artureanec.com/themes/philantrop/faq/' },
        ]
    },
    { 
        name: 'Causes', 
        href: '#',
        dropdown: [
            { name: 'Causes', href: 'https://demo.artureanec.com/themes/philantrop/causes/' },
            { name: 'Causes 2', href: 'https://demo.artureanec.com/themes/philantrop/causes-2/' },
            { name: 'Cause single', href: 'https://demo.artureanec.com/themes/philantrop/cause/health-medicine-for-children/' },
        ]
    },
    { 
        name: 'Shop', 
        href: '#',
        dropdown: [
            { name: 'Product list', href: 'https://demo.artureanec.com/themes/philantrop/shop/' },
            { name: 'Product single', href: 'https://demo.artureanec.com/themes/philantrop/product/new-books-for-children/' },
            { name: 'Cart', href: 'https://demo.artureanec.com/themes/philantrop/cart/' },
            { name: 'Checkout', href: 'https://demo.artureanec.com/themes/philantrop/checkout/' },
        ]
    },
    { 
        name: 'Blog', 
        href: '#',
        dropdown: [
            { name: 'Blog list', href: 'https://demo.artureanec.com/themes/philantrop/blog-list/' },
            { name: 'Blog classic', href: 'https://demo.artureanec.com/themes/philantrop/blog-classic/' },
            { name: 'Single Post', href: 'https://demo.artureanec.com/themes/philantrop/2024/03/05/make-a-big-impact-with-a-small-donation-2/' },
        ]
    },
    { name: 'Contacts', href: '#', dropdown: null },
];

export default function HeaderNavigation() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
            <div className="container flex h-[90px] items-center justify-between">
                <div className="flex flex-shrink-0 items-center gap-x-6">
                    <button aria-label="Open side panel" className="hidden text-gray-700 hover:text-primary lg:block">
                        <Grid size={24} />
                    </button>
                    <Link href="/">
                        <Image
                            src="https://demo.artureanec.com/themes/philantrop/wp-content/themes/philantrop/img/logo.png"
                            alt="Philantrop Logo"
                            width={140}
                            height={25}
                            priority
                            className="h-auto w-auto"
                        />
                    </Link>
                </div>
                
                <nav className="hidden lg:flex">
                    <ul className="flex items-center gap-x-8">
                        {navItems.map((item) => (
                            <li key={item.name} className="group relative flex h-[90px] items-center">
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-x-1 text-base font-medium transition-colors ${
                                        item.name === 'Home' ? 'text-primary' : 'text-foreground hover:text-primary'
                                    }`}
                                >
                                    {item.name}
                                    {item.dropdown && <ChevronDown size={16} className="text-gray-400 transition-transform duration-200 group-hover:rotate-180" />}
                                </Link>
                                {item.name === 'Home' && (
                                    <div className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 transform bg-primary" />
                                )}
                                {item.dropdown && (
                                    <ul className="invisible absolute left-0 top-full z-10 w-56 list-none rounded-md bg-white p-2 opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                                        {item.dropdown.map(subItem => (
                                            <li key={subItem.name}>
                                                <Link href={subItem.href} className="block whitespace-nowrap rounded-sm px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">
                                                    {subItem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden items-center gap-x-6 lg:flex">
                    <button aria-label="Search" className="text-gray-700 hover:text-primary">
                        <Search size={22} />
                    </button>
                    <Link href="#" className="rounded border border-foreground/50 px-8 py-3 text-sm font-medium text-foreground transition-all duration-300 ease-in-out hover:border-primary hover:bg-primary hover:text-white">
                        Donate
                    </Link>
                </div>
                
                <div className="flex items-center lg:hidden">
                    <button 
                        aria-label="Open menu" 
                        className="flex h-8 w-8 flex-col items-center justify-center space-y-1.5 text-gray-700 hover:text-primary"
                    >
                        <span className="block h-0.5 w-6 bg-current transition-all duration-200"></span>
                        <span className="block h-0.5 w-6 bg-current transition-all duration-200"></span>
                        <span className="block h-0.5 w-6 bg-current transition-all duration-200"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}