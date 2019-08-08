
function add_paths(entries, f = null) {
    const a = []
    entries.forEach((entry) => {
        const c_path = '/conf/' + entry.conf_id
        const ci_path = c_path + '/instance/' + entry.instance_id
        const track_path = ci_path + '/track/' + entry.track_id
        let new_obj = Object.assign(entry, {c_path, ci_path, track_path})
        if (entry.submission_id)
            new_obj.submission_path = track_path + '/submission/' + entry.submission_id
        if (f)
            new_obj = Object.assign(new_obj, f(new_obj))
        a.push(new_obj)
    })
    return a
}

function string_sort(values, field = 'when') {
    return values.sort((a, b) => { return ('' + a[field]).localeCompare('' + b[field]) })
}

module.exports = {
    add_paths,
    string_sort,
}
