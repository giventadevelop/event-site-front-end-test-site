'use client'

import React, { useState, useEffect } from 'react'
import './styles.css'

export default function PhilantropPage() {
    const [isMobileMenuActive, setIsMobileMenuActive] = useState(false)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [isDonationPopupVisible, setIsDonationPopupVisible] = useState(false)
    const [isSidePanelVisible, setIsSidePanelVisible] = useState(false)
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (isMobileMenuActive && !target.closest('.philantrop_menu_mobile_container')) {
                setIsMobileMenuActive(false)
            }
            if (isSidePanelVisible && !target.closest('.philantrop_aside_dropdown')) {
                setIsSidePanelVisible(false)
            }
        }

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuActive(false)
                setIsSearchActive(false)
                setIsDonationPopupVisible(false)
                setIsSidePanelVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        document.addEventListener('click', handleOutsideClick)
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('click', handleOutsideClick)
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [isMobileMenuActive, isSidePanelVisible])

    const menuItems = [
        {
            title: 'Home',
            href: '#',
            submenu: [
                { title: 'Charity', href: '/', current: true },
                { title: 'Nonprofit', href: '/home-save-philantrop' },
                { title: 'Volunteers', href: '/volunteers' },
                { title: 'Children care', href: '/home-children' },
                { title: 'Protect animals', href: '/home-animals' },
                { title: 'Ocean pollution', href: '/ocean' },
                { title: 'Intro', href: '/intro' }
            ]
        },
        {
            title: 'Pages',
            href: '#',
            submenu: [
                { title: 'About', href: '/about-us' },
                { title: 'Volunteers team', href: '/volunteers-team' },
                { title: 'Become a volunteer', href: '/become-a-volunteer' },
                { title: 'Services', href: '/services' },
                { title: 'Sponsors', href: '/sponsors' },
                { title: 'Our Stories', href: '/stories' },
                { title: 'Projects', href: '/projects' },
                { title: 'Events', href: '/events' },
                { title: 'Gallery', href: '/gallery' },
                { title: 'FAQ', href: '/faq' },
                { title: 'Pricing Plans', href: '/pricing-plans' }
            ]
        },
        {
            title: 'Causes',
            href: '#',
            submenu: [
                { title: 'Causes', href: '/causes' },
                { title: 'Causes 2', href: '/causes-2' },
                { title: 'Causes 3', href: '/causes-3' },
                { title: 'Causes 4', href: '/causes-4' }
            ]
        },
        {
            title: 'Shop',
            href: '#',
            submenu: [
                { title: 'Product list', href: '/shop' },
                { title: 'Cart', href: '/cart' },
                { title: 'Checkout', href: '/checkout' },
                { title: 'My account', href: '/my-account' }
            ]
        },
        {
            title: 'Blog',
            href: '#',
            submenu: [
                { title: 'Blog Grid', href: '/blog-grid' },
                { title: 'Blog Classic', href: '/blog-classic' }
            ]
        },
        { title: 'Contacts', href: '/contacts' }
    ]

    const socialLinks = [
        { icon: 'fa-facebook', href: 'https://facebook.com/', label: 'Facebook' },
        { icon: 'fa-twitter', href: 'https://twitter.com/', label: 'Twitter' },
        { icon: 'fa-linkedin', href: 'https://linkedin.com/', label: 'LinkedIn' },
        { icon: 'fa-youtube-play', href: 'https://www.youtube.com/', label: 'YouTube' }
    ]

    const services = [
        {
            icon: (
                <svg width="39" height="49" viewBox="0 0 39 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_4405_5768)">
                        <path d="M19.5 48.9993C18.6469 48.9993 18.0375 48.2787 18.0375 47.438C18.0375 46.5973 18.7687 45.8767 19.5 45.8767C28.5187 45.8767 35.9531 38.5507 35.9531 29.6635C35.9531 22.8179 24.9844 9.60712 19.5 3.72231C14.0156 9.60712 3.04688 22.8179 3.04688 29.7836C3.04688 36.5091 7.06875 42.3939 13.4062 44.7958C14.1375 45.1561 14.625 45.9968 14.2594 46.7174C13.8938 47.438 13.0406 47.9184 12.3094 47.5581C4.875 44.7958 0 37.7101 0 29.7836C0 19.5753 17.6719 1.20025 18.4031 0.479665C19.0125 -0.120826 19.9875 -0.120826 20.5969 0.479665C21.3281 1.20025 39 19.5753 39 29.7836C39 40.4723 30.225 48.9993 19.5 48.9993Z"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_4405_5768">
                            <rect width="39" height="49" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            ),
            title: 'Water delivery',
            description: 'Starry flounder sablefish yellowtail barracuda long-finned'
        },
        {
            icon: (
                <svg width="44" height="42" viewBox="0 0 44 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M38.5567 41.9993H28.1237C27.3299 41.9993 26.6495 41.3396 26.6495 40.57C26.6495 39.8003 27.3299 39.1406 28.1237 39.1406H38.5567C39.9175 39.1406 41.0516 38.0412 41.0516 36.7218V15.1721C41.0516 14.2925 40.5979 13.5228 39.8041 13.0831L23.134 3.18777C22.3402 2.74798 21.3196 2.74798 20.4124 3.18777L3.74227 13.0831C2.94845 13.5228 2.49485 14.2925 2.49485 15.1721V36.8317C2.49485 38.1511 3.62887 39.2506 4.98969 39.2506H18.1443C19.2784 39.2506 20.1856 38.371 20.1856 37.2715V33.351C20.1856 32.5813 20.866 31.9216 21.6598 31.9216C22.4536 31.9216 23.134 32.5813 23.134 33.351V37.2715C23.134 39.9103 20.9794 41.9993 18.2577 41.9993H5.3299C2.38144 41.9993 0 39.6904 0 36.8317V15.1721C0 13.3029 0.907217 11.6537 2.60825 10.7742L19.2784 0.878865C20.9794 -0.110663 23.134 -0.110663 24.9485 0.878865L41.6186 10.7742C43.2062 11.7637 44.2268 13.4129 44.2268 15.1721V36.8317C44 39.6904 41.6186 41.9993 38.5567 41.9993Z"/>
                </svg>
            ),
            title: 'Build and repair',
            description: 'Starry flounder sablefish yellowtail barracuda long-finned'
        },
        {
            icon: (
                <svg width="40" height="46" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_4405_5772)">
                        <path d="M19.9452 45.9997C19.178 45.9997 18.5205 45.3394 18.5205 44.569V36.6456H1.31502C0.767075 36.6456 0.328719 36.3155 0.109541 35.8753C-0.109637 35.4351 -0.109637 34.8848 0.21913 34.4446L11.5068 19.258H7.67118C7.12324 19.258 6.68488 18.9279 6.46571 18.4877C6.13694 18.1576 6.24653 17.6073 6.57529 17.1671L18.8493 0.549903C19.3972 -0.110384 20.4931 -0.110384 21.041 0.549903L33.4246 17.1671C33.7534 17.6073 33.7534 18.1576 33.5342 18.5978C33.315 19.0379 32.8767 19.3681 32.3287 19.3681H28.4931L39.7808 34.5547C40.1095 34.9949 40.1095 35.5451 39.8904 35.9853C39.6712 36.4255 39.2328 36.7556 38.6849 36.7556H26.8493C26.0821 36.7556 25.4246 36.0954 25.4246 35.325C25.4246 34.5547 26.0821 33.8944 26.8493 33.8944H35.9452L24.6575 18.8178C24.3287 18.3777 24.3287 17.8274 24.5479 17.3872C24.7671 16.947 25.2054 16.6169 25.7534 16.6169H29.589L19.9452 3.63124L10.4109 16.6169H14.2465C14.7945 16.6169 15.2328 16.947 15.452 17.3872C15.6712 17.8274 15.6712 18.3777 15.3424 18.8178L4.05475 33.8944H19.9452C20.7123 33.8944 21.3698 34.5547 21.3698 35.325V44.569C21.3698 45.3394 20.7123 45.9997 19.9452 45.9997Z"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_4405_5772">
                            <rect width="40" height="46" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            ),
            title: 'Environment',
            description: 'Starry flounder sablefish yellowtail barracuda long-finned'
        },
        {
            icon: (
                <svg width="38" height="52" viewBox="0 0 38 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_4405_5776)">
                        <path d="M24.4625 43.0849H13.4187C10.6875 43.0849 8.55 40.8564 8.55 38.0088V36.3992C2.85 32.4373 -0.356252 25.7516 -1.59256e-06 18.6945C0.593748 8.6659 8.55 0.494474 18.05 -0.00076374C23.275 -0.248383 28.2625 1.73257 32.0625 5.44686C35.8625 9.16114 38 14.3611 38 19.8088C38 20.6754 37.2875 21.4183 36.4562 21.4183C35.625 21.4183 34.9125 20.6754 34.9125 19.8088C34.9125 15.2278 33.1312 10.8945 29.925 7.67543C26.7187 4.45638 22.5625 2.84686 18.05 3.09447C10.0937 3.4659 3.44375 10.3992 2.96875 18.8183C2.6125 25.1326 5.7 30.9516 10.8062 34.1707C11.2812 34.4183 11.5187 34.9135 11.5187 35.5326V38.0088C11.5187 39.123 12.35 39.9897 13.4187 39.9897H24.4625C25.5312 39.9897 26.3625 39.123 26.3625 38.0088V35.5326C26.3625 34.6659 27.075 33.923 27.9062 33.923C28.7375 33.923 29.45 34.6659 29.45 35.5326V38.0088C29.45 40.7326 27.1937 43.0849 24.4625 43.0849Z"/>
                        <path d="M27.9063 37.019C27.4313 37.019 26.9563 36.7714 26.6 36.2761C26.125 35.5333 26.3625 34.5428 27.075 34.1714C30.2813 32.1904 32.775 29.0952 33.9625 25.5047C34.2 24.7618 35.15 24.2666 35.8625 24.638C36.575 24.8856 37.05 25.8761 36.6938 26.619C35.15 30.9523 32.3 34.5428 28.5 36.8952C28.3813 37.019 28.1438 37.019 27.9063 37.019Z"/>
                        <path d="M25.7688 47.5413H12.2313C11.4 47.5413 10.6875 46.7985 10.6875 45.9318C10.6875 45.0651 11.4 44.3223 12.2313 44.3223H25.7688C26.6 44.3223 27.3125 45.0651 27.3125 45.9318C27.3125 46.7985 26.6 47.5413 25.7688 47.5413Z"/>
                        <path d="M24.4625 43.0843H13.4188C12.5875 43.0843 11.875 42.3414 11.875 41.4748C11.875 40.6081 12.5875 39.8652 13.4188 39.8652H24.4625C25.2938 39.8652 26.0062 40.6081 26.0062 41.4748C26.0062 42.3414 25.2938 43.0843 24.4625 43.0843Z"/>
                        <path d="M21.1375 51.9983H16.7437C15.9125 51.9983 15.2 51.2555 15.2 50.3888C15.2 49.5222 15.9125 48.7793 16.7437 48.7793H21.1375C21.9687 48.7793 22.6812 49.5222 22.6812 50.3888C22.6812 51.3793 21.9687 51.9983 21.1375 51.9983Z"/>
                    </g>
                    <defs>
                        <clipPath id="clip0_4405_5776">
                            <rect width="38" height="52"/>
                        </clipPath>
                    </defs>
                </svg>
            ),
            title: 'Education',
            description: 'Starry flounder sablefish yellowtail barracuda long-finned'
        }
    ]

    return (
        <div className={`home wp-singular page-template-default page page-id-12 wp-theme-philantrop theme-philantrop woocommerce-no-js tribe-no-js elementor-default elementor-kit-6 elementor-page elementor-page-12`}>
            
            {/* Preloader */}
            <div className="philantrop_preloader_container">
                <div className="philantrop_preloader_logo"></div>
            </div>

            {/* Header Search Overlay */}
            {isSearchActive && (
                <>
                    <div className="philantrop_header_search_overlay" onClick={() => setIsSearchActive(false)}></div>
                    <div className="philantrop_header_search_container">
                        <form name="header_search_form" method="get" className="philantrop_search_form">
                            <input type="text" name="s" placeholder="Search" title="" className="form__field" />
                            <div className="clear"></div>
                            <div className="philantrop_header_search_close_button" onClick={() => setIsSearchActive(false)}></div>
                        </form>
                    </div>
                </>
            )}

            {/* Donation Popup */}
            {isDonationPopupVisible && (
                <>
                    <div className="philantrop_close_main_donation_popup_layer" onClick={() => setIsDonationPopupVisible(false)}></div>
                    <div className="philantrop_main_donation_popup">
                        <div className="give-form-wrap give-display-onpage">
                            <div className="give-goal-progress">
                                <div className="raised">
                                    <span className="income">$112,695</span> of <span className="goal-text">$100,000</span> raised
                                </div>
                                <div className="progress-bar">
                                    <div className="give-progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
                                        <span style={{width: '100%', background: 'linear-gradient(180deg, #34bdc6 0%, #34bdc6 100%), linear-gradient(180deg, #fff 0%, #ccc 100%)', backgroundBlendMode: 'multiply'}}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Side Panel */}
            {isSidePanelVisible && (
                <div className="philantrop_aside_dropdown">
                    <div className="philantrop_aside_dropdown_inner">
                        <div className="philantrop_aside_bg"></div>
                        <div className="philantrop_aside_dropdown_close" onClick={() => setIsSidePanelVisible(false)}></div>
                        
                        <div className="philantrop_side_panel_info_container">
                            <div className="philantrop_side_panel_info_item philantrop_side_panel_address">
                                <h6>New York</h6>
                                Agencium Ltd, 31 Ashcombe,<br/>London NW5 1QU, UK
                            </div>
                            <div className="philantrop_side_panel_info_item">
                                <div className="philantrop_side_panel_title">Phone</div>
                                <div className="philantrop_side_panel_phone_1">
                                    <a href="tel:+123456789">+1 (234) 56789</a>
                                </div>
                                <div className="philantrop_side_panel_phone_2">
                                    <a href="tel:+123456789">+1 (234) 56789</a>
                                </div>
                            </div>
                            <div className="philantrop_side_panel_info_item philantrop_side_panel_email">
                                <div className="philantrop_side_panel_title">Email</div>
                                <a href="mailto:support@philantrop.com">support@philantrop.com</a>
                            </div>
                        </div>
                        
                        <div className="philantrop_side_panel_socials_container">
                            <div className="philantrop_side_panel_title">Follow us</div>
                            <ul className="philantrop_side_panel_socials">
                                {socialLinks.map((social, index) => (
                                    <li key={index}>
                                        <a className={`hs_${social.icon.replace('fa-', '')}`} href={social.href} target="_self">
                                            <i className={`fa ${social.icon}`}></i>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="philantrop_side_panel_header_button_container">
                            <a className="philantrop_side_panel_header_button" href="#">
                                <span>Request a quote</span>
                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/>
                                    <path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="philantrop_page_wrapper">

                {/* Header */}
                <header className={`philantrop_header_type_3 ${scrollY > 100 ? 'philantrop_sticky_header_container' : 'philantrop_transparent_header_on'} philantrop_header_button_on philantrop_side_panel_on`}>
                    <div className="philantrop_header_inner_container">
                        <div className="philantrop_header_bg_overlay"></div>

                        {/* Logo Container */}
                        <div className="philantrop_header_logo_container">
                            <div className="philantrop_side_panel_button" onClick={() => setIsSidePanelVisible(true)}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_4315_7125)">
                                        <path d="M4.19995 8.50391C2.49995 8.50391 1.3001 8.30391 0.600098 7.50391C9.76324e-05 6.80391 0 5.70371 0 4.30371H0.800049H0C0 1.40371 0.200049 0.00390625 4.30005 0.00390625C8.40005 0.00390625 8.6001 1.40371 8.6001 4.30371C8.6001 5.70371 8.6 6.80391 8 7.50391C7.2 8.30391 5.89995 8.50391 4.19995 8.50391ZM4.19995 1.50391C1.39995 1.50391 1.3999 1.70371 1.3999 4.30371C1.2999 5.10371 1.39995 5.80391 1.69995 6.50391C1.99995 6.80391 2.79995 7.00391 4.19995 7.00391C5.59995 7.00391 6.39995 6.80391 6.69995 6.50391C6.99995 5.80391 7.1 5.00371 7 4.30371C7 1.70371 6.99995 1.50391 4.19995 1.50391Z" fill="#474747"/>
                                        <path d="M15.2 8.50391C13.5 8.50391 12.3001 8.30391 11.6001 7.50391C11.0001 6.80391 11 5.70371 11 4.30371H11.8H11C11 1.40371 11.2 0.00390625 15.3 0.00390625C19.4 0.00390625 19.6001 1.40371 19.6001 4.30371C19.6001 5.70371 19.6 6.80391 19 7.50391C18.2 8.30391 16.9 8.50391 15.2 8.50391ZM15.2 1.50391C12.4 1.50391 12.3999 1.70371 12.3999 4.30371C12.2999 5.10371 12.4 5.80391 12.7 6.50391C13 6.80391 13.8 7.00391 15.2 7.00391C16.6 7.00391 17.4 6.80391 17.7 6.50391C18 5.80391 18.1 5.00371 18 4.30371C18 1.70371 18 1.50391 15.2 1.50391Z" fill="#474747"/>
                                        <path d="M4.19995 19.5039C2.49995 19.5039 1.3001 19.3039 0.600098 18.5039C9.76324e-05 17.8039 0 16.7037 0 15.3037H0.800049H0C0 12.4037 0.200049 11.0039 4.30005 11.0039C8.40005 11.0039 8.6001 12.4037 8.6001 15.3037C8.6001 16.7037 8.6 17.8039 8 18.5039C7.2 19.3039 5.89995 19.5039 4.19995 19.5039ZM4.19995 12.5039C1.39995 12.5039 1.3999 12.7037 1.3999 15.3037C1.2999 16.1037 1.39995 16.8039 1.69995 17.5039C1.99995 17.8039 2.79995 18.0039 4.19995 18.0039C5.59995 18.0039 6.39995 17.8039 6.69995 17.5039C6.99995 16.8039 7.1 16.0037 7 15.3037C7 12.7037 6.99995 12.5039 4.19995 12.5039Z" fill="#474747"/>
                                        <path d="M15.2 19.5039C13.5 19.5039 12.3001 19.3039 11.6001 18.5039C11.0001 17.8039 11 16.7037 11 15.3037H11.8H11C11 12.4037 11.2 11.0039 15.3 11.0039C19.4 11.0039 19.6001 12.4037 19.6001 15.3037C19.6001 16.7037 19.6 17.8039 19 18.5039C18.2 19.3039 16.9 19.5039 15.2 19.5039ZM15.2 12.5039C12.4 12.5039 12.3999 12.7037 12.3999 15.3037C12.2999 16.1037 12.4 16.8039 12.7 17.5039C13 17.8039 13.8 18.0039 15.2 18.0039C16.6 18.0039 17.4 17.8039 17.7 17.5039C18 16.8039 18.1 16.0037 18 15.3037C18 12.7037 18 12.5039 15.2 12.5039Z" fill="#474747"/>
                                    </g>
                                </svg>
                            </div>
                            
                            <div className="philantrop_logo_box">
                                <a className="philantrop_logo philantrop_retina_on" href="/">
                                    <img src="/images/logo_white.png" alt="Philantrop Logo" />
                                </a>
                            </div>
                        </div>

                        {/* Main Menu */}
                        <div className="philantrop_header_menu_container">
                            <div className="philantrop_main_menu_container">
                                <ul className="philantrop_main_menu">
                                    {menuItems.map((item, index) => (
                                        <li key={index} className={`menu-item ${item.submenu ? 'menu-item-has-children' : ''}`}>
                                            <a href={item.href}>{item.title}</a>
                                            {item.submenu && (
                                                <ul className="sub-menu">
                                                    {item.submenu.map((subItem, subIndex) => (
                                                        <li key={subIndex} className={`menu-item ${subItem.current ? 'current-menu-item' : ''}`}>
                                                            <a href={subItem.href} aria-current={subItem.current ? 'page' : undefined}>
                                                                {subItem.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Header Buttons */}
                        <div className="philantrop_header_buttons_container">
                            <div className="philantrop_header_search_button" onClick={() => setIsSearchActive(true)}>
                                <svg className="icon">
                                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.19 0a8.19 8.19 0 016.47 13.212l5.04 5.04a1.024 1.024 0 11-1.448 1.448l-5.04-5.04A8.19 8.19 0 118.19 0zm0 2.048a6.143 6.143 0 100 12.285 6.143 6.143 0 000-12.285z"/>
                                    </svg>
                                </svg>
                            </div>
                            
                            <div className="philantrop_header_button_block button_view_type_3">
                                <button className="philantrop_header_button header_button_view_type_3" onClick={() => setIsDonationPopupVisible(true)}>
                                    <span>Donate</span>
                                </button>
                            </div>
                            
                            <div className="philantrop_hamburger_container">
                                <div 
                                    className={`philantrop_hamburger philantrop_menu_trigger ${isMobileMenuActive ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuActive(!isMobileMenuActive)}
                                >
                                    <div className="philantrop_hamburger_inner"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuActive && (
                    <div className="philantrop_menu_mobile_container active">
                        <div className="philantrop_menu_mobile_inner">
                            <div className="philantrop_menu_mobile_buttons_container">
                                <div className="philantrop_menu_mobile_search" onClick={() => setIsSearchActive(true)}>
                                    <svg className="icon">
                                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.19 0a8.19 8.19 0 016.47 13.212l5.04 5.04a1.024 1.024 0 11-1.448 1.448l-5.04-5.04A8.19 8.19 0 118.19 0zm0 2.048a6.143 6.143 0 100 12.285 6.143 6.143 0 000-12.285z"/>
                                        </svg>
                                    </svg>
                                </div>
                                <div className="philantrop_menu_mobile_close" onClick={() => setIsMobileMenuActive(false)}></div>
                            </div>
                            
                            <div className="philantrop_menu_mobile_wrapper">
                                <ul className="philantrop_mobile_menu">
                                    {menuItems.map((item, index) => (
                                        <li key={index} className={`menu-item ${item.submenu ? 'menu-item-has-children' : ''}`}>
                                            <a href={item.href}>{item.title}</a>
                                            {item.submenu && (
                                                <ul className="sub-menu">
                                                    {item.submenu.map((subItem, subIndex) => (
                                                        <li key={subIndex} className={`menu-item ${subItem.current ? 'current-menu-item' : ''}`}>
                                                            <a href={subItem.href}>{subItem.title}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                
                                <ul className="philantrop_mobile_menu_socials">
                                    {socialLinks.map((social, index) => (
                                        <li key={index}>
                                            <a className={`hs_${social.icon.replace('fa-', '')}`} href={social.href} target="_self">
                                                <i className={`fa ${social.icon}`}></i>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                
                                <img src="/images/mobile_menu_image.png" className="philantrop_mobile_menu_image" alt="Mobile Menu Image" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="philantrop_content_wrapper">
                    {/* Hero Section */}
                    <section className="elementor-section elementor-top-section elementor-section-stretched elementor-section-boxed elementor-section-height-default philantrop_parallax_no">
                        <div className="elementor-background-overlay"></div>
                        <div className="elementor-container elementor-column-gap-default">
                            <div className="elementor-column elementor-col-33 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_heading_widget">
                                        <h4 className="philantrop_heading">
                                            The long journey to end poverty begins with a child.
                                        </h4>
                                    </div>
                                    <div className="philantrop_button_widget">
                                        <div className="philantrop_button_container view_type_3">
                                            <a className="philantrop_alt_button" href="#" target="_blank">
                                                <span>Donate</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="elementor-column elementor-col-33 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_heading_widget">
                                        <h4 className="philantrop_heading">
                                            No One Children Can Thrive on an Empty Stomach.
                                        </h4>
                                    </div>
                                    <div className="philantrop_button_widget">
                                        <div className="philantrop_button_container view_type_3">
                                            <a className="philantrop_alt_button" href="#" target="_blank">
                                                <span>Explore more</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="elementor-column elementor-col-33 elementor-top-column elementor-hidden-tablet elementor-hidden-mobile_extra elementor-hidden-mobile">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_rotatable_text_widget">
                                        <div className="philantrop_rotatable_text_container">
                                            <div className="philantrop_rotatable_text">Donate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="elementor-section elementor-top-section elementor-section-boxed elementor-section-height-default philantrop_parallax_no" id="about">
                        <div className="elementor-container elementor-column-gap-default">
                            <div className="elementor-column elementor-col-25 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_heading_widget">
                                        <div className="philantrop_up_heading">
                                            <span className="philantrop_up_heading_1"></span>
                                            <span className="philantrop_up_heading_2"></span>
                                            What we do
                                        </div>
                                        <h3 className="philantrop_heading">
                                            Various things we help in whole world
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="elementor-column elementor-col-25 elementor-top-column elementor-hidden-tablet_extra elementor-hidden-tablet elementor-hidden-mobile_extra elementor-hidden-mobile">
                                <div className="elementor-widget-wrap"></div>
                            </div>
                            
                            <div className="elementor-column elementor-col-25 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    {services.slice(0, 2).map((service, index) => (
                                        <div key={index} className="philantrop_icon_box_widget">
                                            <div className="philantrop_icon_box_item layout_type_row">
                                                <div className="philantrop_icon_container">
                                                    {service.icon}
                                                </div>
                                                <div className="philantrop_icon_box_content_cont">
                                                    <h4 className="philantrop_icon_box_title">{service.title}</h4>
                                                    <div className="philantrop_info_container">
                                                        <p>{service.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="elementor-column elementor-col-25 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    {services.slice(2, 4).map((service, index) => (
                                        <div key={index + 2} className="philantrop_icon_box_widget">
                                            <div className="philantrop_icon_box_item layout_type_row">
                                                <div className="philantrop_icon_container">
                                                    {service.icon}
                                                </div>
                                                <div className="philantrop_icon_box_content_cont">
                                                    <h4 className="philantrop_icon_box_title">{service.title}</h4>
                                                    <div className="philantrop_info_container">
                                                        <p>{service.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ticker Section */}
                    <section className="elementor-section elementor-top-section elementor-section-full_width elementor-section-stretched elementor-section-height-default philantrop_parallax_no">
                        <div className="elementor-container elementor-column-gap-no">
                            <div className="elementor-column elementor-col-100 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_ticker_widget">
                                        <div className="philantrop_ticker_wrapper ticker_view_type_2">
                                            <div className="philantrop_ticker_line marquee3k">
                                                <div className="philantrop_ticker_item">
                                                    <div className="philantrop_ticker_item_wrapper">
                                                        <span className="philantrop_ticker_text">People need your help</span>
                                                        <span className="philantrop_ticker_divider"></span>
                                                        <span className="philantrop_ticker_text">People need your help</span>
                                                        <span className="philantrop_ticker_divider"></span>
                                                        <span className="philantrop_ticker_text">People need your help</span>
                                                        <span className="philantrop_ticker_divider"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Images Section */}
                    <section className="elementor-section elementor-top-section elementor-section-stretched elementor-hidden-mobile elementor-section-boxed elementor-section-height-default philantrop_parallax_no">
                        <div className="elementor-container elementor-column-gap-default">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className="elementor-column elementor-col-20 elementor-top-column">
                                    <div className="elementor-widget-wrap elementor-element-populated">
                                        <div className="philantrop_image_widget">
                                            <div className="philantrop_image_container">
                                                <div className="philantrop_image_border"></div>
                                                <img 
                                                    decoding="async" 
                                                    src={`/images/Photo${num > 3 ? '_' + (num - 1) : num === 1 ? '' : '_' + num}-386x646.jpg`}
                                                    alt="Philantrop Custom Image" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats and About Section */}
                    <section className="elementor-section elementor-top-section elementor-section-boxed elementor-section-height-default philantrop_parallax_no">
                        <div className="elementor-container elementor-column-gap-default">
                            <div className="elementor-column elementor-col-50 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_counter_align_left">
                                        <div className="elementor-counter">
                                            <div className="elementor-counter-title">People helped</div>
                                            <div className="elementor-counter-number-wrapper">
                                                <span className="elementor-counter-number-prefix"></span>
                                                <span className="elementor-counter-number">10</span>
                                                <span className="elementor-counter-number-suffix">k</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="philantrop_counter_align_left">
                                        <div className="elementor-counter">
                                            <div className="elementor-counter-title">Closed projects</div>
                                            <div className="elementor-counter-number-wrapper">
                                                <span className="elementor-counter-number-prefix"></span>
                                                <span className="elementor-counter-number">200</span>
                                                <span className="elementor-counter-number-suffix">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="elementor-column elementor-col-50 elementor-top-column">
                                <div className="elementor-widget-wrap elementor-element-populated">
                                    <div className="philantrop_heading_widget">
                                        <div className="philantrop_up_heading">
                                            <span className="philantrop_up_heading_1"></span>
                                            <span className="philantrop_up_heading_2"></span>
                                            About foundation
                                        </div>
                                        <h3 className="philantrop_heading">
                                            Hard times for the world & opportunities to help people in need
                                        </h3>
                                    </div>
                                    <div className="elementor-text-editor">
                                        <p><strong>Halosaur duckbilled barracudina, goosefish gar pleco, chum salmon armoured catfish gudgeon sawfish whitefish orbicular batfish</strong></p>
                                        <p>Mummichog paradise fish! Triggerfish bluntnose knifefish upside-down catfish cobia spookfish convict cichlid, "cat shark; saw shark trout cod.</p>
                                    </div>
                                    <div className="philantrop_button_widget">
                                        <div className="philantrop_button_container view_type_1">
                                            <a className="philantrop_button" href="/about-us" target="_blank">
                                                <span>Explore more</span>
                                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/>
                                                    <path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                
                {/* Back to Top Button */}
                <div className="philantrop_back_to_top_button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}></div>
            </div>
        </div>
    )
}