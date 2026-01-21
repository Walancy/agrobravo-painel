
export const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
}

export const maskPhone = (value: string) => {
    let r = value.replace(/\D/g, '')
    if (r.length > 11) r = r.slice(0, 11)

    if (r.length > 10) {
        r = r.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (r.length > 5) {
        r = r.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (r.length > 2) {
        r = r.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    } else if (r.length > 0) {
        r = r.replace(/^(\d*)/, '($1')
    }
    return r
}

export const maskCEP = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1')
}

export const validateEmail = (email: string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
}
