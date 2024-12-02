import { twMerge } from "tailwind-merge";
import EditBar from "./EditBar";
import { IoIosArrowDown } from "react-icons/io";
import { ComponentProps, ReactNode, useState } from "react";
import CustomizeTab from "./CustomizeTab";
import LayoutHeader from "@/layout/LayoutHeader";
import Security from "./Security";

interface SectionProps {
	children?: ReactNode[]
	activated?: boolean
	className?: string
}

export function Section({ activated, children }: SectionProps) {
	return (
		<div>
			{ children && children[0] }
			{
				children && activated && 
				<div className="py-5">
					{ children[1] }
				</div>
			}
		</div>
	)
}

interface SectionHeaderProps extends ComponentProps<'div'> {
	children?: string
	activated?: boolean
	className?: string
	dropDown?: boolean
}

export function SectionHeader({ children, activated, className, dropDown, ...props }: SectionHeaderProps) {
	return (
		<div 
			className={
				twMerge("h-14 hover:border-[rgba(255,255,255,0.5)] select-none duration-300 flex items-center justify-between bg-secondary border border-border rounded-lg px-5 cursor-pointer", className)
			}
			{...props}
			>
			<h1 className="font-medium">{ children }</h1>
			{dropDown && <IoIosArrowDown className={activated ? 'text-2xl rotate-90' : "text-2xl"} />}
		</div>
	)
}

interface SectionContentProps extends ComponentProps<'div'> {
	children?: ReactNode
	className?: string
}

export function SectionContent({ children, className }: SectionContentProps) {
	return (
		<div className={twMerge("px-5", className)}>
			{ children }
		</div>
	)
}

function Settings() {
	const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'display' | null>(null);

	const toggleActiveSection = (type: 'profile' | 'security' | 'display') => {
		setActiveSection(prev => {
			if (prev == type) setActiveSection(null);
			return type;
		})
	}

	return (
		<div>
			<LayoutHeader>Settings</LayoutHeader>
			<div className="space-y-5">
				<Section activated={activeSection == 'profile'}>
					<SectionHeader onClick={() => toggleActiveSection('profile')}>Profile</SectionHeader>
					{activeSection == 'profile' && 
						<SectionContent>
							<span className="inline-block mb-3">username</span>
							<EditBar type="username"/>
							<span className="inline-block mt-5 mb-3">email</span>
							<EditBar type="email" />
						</SectionContent> }
				</Section>
				<Section activated={activeSection == 'security'}>
					<SectionHeader onClick={() => toggleActiveSection('security')}>Security</SectionHeader>
					{activeSection == 'security' && 
						<SectionContent>
							<Security />
						</SectionContent>}
				</Section>
				<Section activated={activeSection == 'display'}>
					<SectionHeader onClick={() => toggleActiveSection('display')}>Display</SectionHeader>
					{activeSection == 'display' && 
						<SectionContent>
							<CustomizeTab />
						</SectionContent>}
				</Section>
			</div>
		</div>
	);
}

export default Settings;