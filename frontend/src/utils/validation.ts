interface Pattern {
	username: RegExp,
	email: RegExp,
	password: RegExp
}

const patterns: Pattern = {
	username: /^[a-z][\w-]{2,15}[a-z\d]$/,
	email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
	password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/
}

const validate = (type: 'username' | 'email' | 'password', input: string | undefined) : boolean => {
	if (!input)
		return (false);
	return patterns[type].test(input);
}

const isEmpty = (input: string) => {
	if (input == '') return true
	return /^\s+$/.test(input)
}

export { validate, isEmpty }