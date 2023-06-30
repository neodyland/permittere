"use client"
import React from "react";
import { ReactNode, useLayoutEffect, useState } from "react";

export default function WithCaptcha(props: WithCaptchaProps) {
	return (
		<html lang="en">
			<WithCapcthaRaw {...props} />
		</html>
	);
}

export interface WithCaptchaProps {
	error?: ReactNode;
	loading?: ReactNode;
	body?: ReactNode;
	head?: ReactNode;
}

function WithCapcthaRaw(props: WithCaptchaProps) {
	const [session, setSession] = useState<string | null>(null);
	const [error, isError] = useState<boolean>(false);
	useLayoutEffect(() => {
		(async () => {
			const shield = localStorage.getItem("shield");
			if (shield) {
				const ok = await fetch("https://shield.neody.land/api/verify", {
					headers: {
						"Content-Type": "text/plain",
					},
					method: "POST",
					body: shield,
				})
					.then((res) => res.ok)
					.catch(() => false);
				if (ok) return setSession(shield);
			}
		})();
		(window as any).on_captcha_done = async ({
			done,
			value,
		}: {
			done: boolean;
			value?: string;
		}) => {
			if (!done ?? !value) return isError(true);
			const ok = await fetch("https://shield.neody.land/api/verify", {
				headers: {
					"Content-Type": "text/plain",
				},
				method: "POST",
				body: value,
			})
				.then((res) => res.ok)
				.catch(() => false);
			if (ok) {
				localStorage.setItem("shield", value);
				return setSession(value);
			}
		};
	}, []);
	const Head = props.head ? (
		<>{props.head}</>
	) : (
		<head>
			<script src="https://shield.neody.land/index.min.js" defer></script>
		</head>
	);
	const Body = props.body ? (
		<>{props.body}</>
	) : (
		<body>
			<p>none</p>
		</body>
	);
	const Loading = props.loading ? (
		<>{props.loading}</>
	) : (
		<body>
			<p>loading</p>
		</body>
	);
	const Error = props.error ? (
		<>{props.error}</>
	) : (
		<body>
			<p>error</p>
		</body>
	);
	if (error)
		return (
			<>
				{Head}
				{Error}
			</>
		);
	if (!session)
		return (
			<>
				<>
					{Head}
					{Loading}
				</>
			</>
		);
	return (
		<>
			<>
				{props.head ? <>{props.head}</> : <head></head>}
				{Body}
			</>
		</>
	);
}
