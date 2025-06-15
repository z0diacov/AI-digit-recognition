export async function recognize(data, folderName) {
    return fetch('/recognize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data, folder_name: folderName }),
    });
}

export async function createFolder(folderName) {
    return fetch('/create/folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder_name: folderName }),
    });
}

export async function deleteFolder(folderName) {
    return fetch('/delete/folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder_name: folderName }),
    });
}

export async function showAi(folderName) {
    return fetch(`/AI/${folderName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function getDataSet(ai_name, answer) {
    return fetch(`/get/dataset`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ai_name: ai_name, 
            answer: answer
        })
    });
}

export async function createCase(ai_name, answer, data) {
    return fetch(`/create/case`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ai_name: ai_name, 
            answer: answer,
            data: data
        })
    });
}

export async function learnCheck(ai_name) {
    return fetch(`/AI/learn-check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ai_name: ai_name
        })
    });
}

export async function deleteCase(ai_name, answer, index) {
    return fetch(`/delete/case`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ai_name: ai_name,
            answer: answer,
            index: index
        })
    });
}