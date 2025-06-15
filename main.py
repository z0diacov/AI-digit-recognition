from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
import pathes, models
from fastapi.staticfiles import StaticFiles
import time 
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import fs
import functions
import process
from processtest import learn_nn

app = FastAPI()

app.mount("/static",  StaticFiles(directory=pathes.STATIC_DIR_PATH), name="static")

templates = Jinja2Templates(pathes.TEMPLATES_DIR_PATH)


@app.exception_handler(StarletteHTTPException)
async def custom_404_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return templates.TemplateResponse("404.html", {"request": request})
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.get("/")
async def render_main_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, 
                                                     "folders": fs.get_list_directories(pathes.DIRECTORY_OF_NETWORKS_PATH)})

@app.post("/recognize")
async def test(data: models.Recognition_data):
    try:
        hyperparameters = fs.elem_from_json_path(pathes.NETWORK_HYPERPARAMETERS_PATH)
        
        full_folder_path = os.path.join(pathes.DIRECTORY_OF_NETWORKS_PATH, data.folder_name) if data.folder_name != None else pathes.DIRECTORY_OF_IDEAL_PATH
        res = process.exec_nn(
            pathes.EXECUTABLE_NEURAL_NETWORK_PATH,
            full_folder_path,
            data.data,
            hyperparameters
        )

        if res['status_code']:
            print(res['stderr'])
            return {'status': 'error', 'message': f'status code {res["status_code"]}, stderr: {res["stderr"]}'}
        
        if res['stderr']:
            print(res['stderr'])
            return {'status': 'error', 'message': f'stderr: {res["stderr"]}'}
        
        answer_data = {
            'res': None,
            'probabilities': {}
        }

        probability_arr = [round(float(item) * 100, 1) for item in res['stdout'].split(" ")[: -1]]

        i = 0

        for answer_variant in hyperparameters['answers']:
            answer_data['probabilities'][answer_variant] = probability_arr[i]
            i += 1

        answer_data['res'] = probability_arr.index(max(probability_arr))

        return {'status': 'success', 'data': answer_data}
    
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in recognizing {str(e)}"
        )
    

@app.post("/create/folder", status_code=200)
async def new_folder(data: models.Create_folder):
    folder_path = os.path.join(data.base_path, data.folder_name)
    if os.path.exists(folder_path):
        if os.path.isdir(folder_path):
            return {"status": "exist", "message": f"AI is alredy exists"}
    
    try:

        data_set_folder_path = os.path.join(folder_path, 'data_set')
        info_path = os.path.join(folder_path, 'info.json')
        weights_and_basies_path = os.path.join(folder_path, "weights_and_basies")

        network_hyperparameters = fs.elem_from_json_path(pathes.NETWORK_HYPERPARAMETERS_PATH)

        os.makedirs(folder_path)
        os.makedirs(weights_and_basies_path)
        os.makedirs(data_set_folder_path)

        info_dict = {
            "state": "ready", #states: thinging, learning, ready
            "lens": {}
        }

        for i in range(1, network_hyperparameters['amount_of_dims']):
            fs.create_and_insert_json(
                os.path.join(weights_and_basies_path, f'W{i}.json'),
                functions.create_random_array(network_hyperparameters['dims'][i-1], network_hyperparameters['dims'][i])
            )
            
            if network_hyperparameters['basies']:
                fs.create_and_insert_json(
                    os.path.join(weights_and_basies_path, f'B{i}.json'),
                    functions.create_random_array(1, network_hyperparameters['dims'][i])
                )

        for folder_to_create in network_hyperparameters['answers']:
            info_dict["lens"][folder_to_create] = 0
            os.makedirs(os.path.join(data_set_folder_path, folder_to_create))

        fs.create_and_insert_json(os.path.join(info_path), info_dict)

        return {"status": "created"}
    
    except Exception as e:
        fs.delete_folder(folder_path)
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in creating AI {str(e)}"
        )
    
@app.post("/delete/folder")
async def new_folder(request: Request, data: models.Delete_folder):

    folder_path = os.path.join(data.base_path, data.folder_name)

    if not os.path.exists(folder_path):
        return {"status": "notExist", "message": f"AI is not exist"}
    
    try:
        fs.delete_folder(folder_path) #deleting all folder with all files

        return {"status": "redirect", "url": "/"}
        
    
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in deleting AI {str(e)}"
        )
    
@app.get("/AI/{ai_name}")
async def show_ai(request: Request, ai_name: str):
    try:
        folder_path = os.path.join(pathes.DIRECTORY_OF_NETWORKS_PATH, ai_name)

        if os.path.exists(folder_path):
            return templates.TemplateResponse("Ai.html", {"request": request, "AI": ai_name, "folders": fs.get_list_directories(pathes.DIRECTORY_OF_NETWORKS_PATH)})
        else:
            return templates.TemplateResponse("notExist.html", {"request": request, "AI": ai_name})
        
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in showing ai {str(e)}"
        )
    
@app.get("/AI/{ai_name}/learn")
async def show_learn(request: Request, ai_name: str):
    try:
        folder_path = os.path.join(pathes.DIRECTORY_OF_NETWORKS_PATH, ai_name)
        folder_data_set_path = os.path.join(folder_path, 'data_set')

        if os.path.exists(folder_data_set_path):

            return templates.TemplateResponse("learn.html", {
                "request": request,                                   
                "folders": fs.get_list_directories(pathes.DIRECTORY_OF_NETWORKS_PATH),
                "answers": fs.elem_from_json_path(os.path.join(folder_path, 'info.json'))['lens'],
                "AI": ai_name
            })

        else:

            return templates.TemplateResponse("notExist.html", {"request": request, "AI": ai_name})
        
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in showing learn {str(e)}"
        )
    
@app.post("/get/dataset")
async def get_data_set(request: Request, data: models.Get_data_set):
    try:
        all_cases = []
        folder_path = os.path.join(data.base_path, data.ai_name)

        if os.path.exists(folder_path):
            info = fs.elem_from_json_path(os.path.join(folder_path, 'info.json'))
            if data.answer in info['lens']:
                for file_name in fs.get_list_directories(os.path.join(folder_path, 'data_set', data.answer)):
                    all_cases.append({
                        'index': file_name[4: -5], #-ext
                        'picture': fs.elem_from_json_path(os.path.join(folder_path, 'data_set', data.answer, file_name))
                    })
                    
                return {'status': 'success', 'data': all_cases}
            else:
                return {'status': 'notExist', 'message': f'AI {data.ai_name} has no answer {data.answer}'}
        else:
            return {'status': 'notExist', 'message': f'Path {folder_path} is not exist'}
        
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in getting dataset {str(e)}"
        )
    
@app.post("/create/case")
async def create_case(data: models.Create_case):
    try:
        folder_path = os.path.join(data.base_path, data.ai_name)

        if os.path.exists(folder_path):

            info_path = os.path.join(folder_path, 'info.json')
            info = fs.elem_from_json_path(info_path)

            if data.answer in info['lens']:

                directories = fs.get_list_directories(os.path.join(folder_path, 'data_set', data.answer))

                if info['lens'][data.answer] == 0:
                    last_index = 0
                else:
                    last_file = directories[-1]
                    last_index = int(last_file[4: last_file.index(".")])

                fs.create_and_insert_json(os.path.join(folder_path, 'data_set', data.answer, f'case{last_index + 1}.json'), data.data)

                info['lens'][data.answer] = len(directories) + 1
                fs.create_and_insert_json(info_path, info)

                return {'status': 'success'}
            else:
                return {'status': 'notExist', 'message': f'AI {data.ai_name} has no answer {data.answer}'}
        else:
            return {'status': 'notExist', 'message': f'Ai {data.ai_name} is not exist'}
        

    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in creating case {str(e)}"
        )
    
@app.post("/delete/case")
async def delete_case(request: Request, data: models.Delete_case):
    try:
        folder_path = os.path.join(data.base_path, data.ai_name)

        if os.path.exists(folder_path):

            info_path = os.path.join(folder_path, 'info.json')
            info = fs.elem_from_json_path(info_path)

            if data.answer in info['lens']:

                path_to_delete = os.path.join(folder_path, 'data_set', data.answer, f'case{data.index}.json')

                if os.path.exists(path_to_delete):

                    os.remove(path_to_delete)

                    info['lens'][data.answer] = len(fs.get_list_directories(os.path.join(folder_path, 'data_set', data.answer)))
                    fs.create_and_insert_json(info_path, info)

                    return {'status': 'success'}
                else:
                    return {'status': 'notExist', 'message': f'this case is not exist'}
            else:
                return {'status': 'notExist', 'message': f'AI {data.ai_name} has no answer {data.answer}'}
        else:
            return {'status': 'notExist', 'message': f'Ai {data.ai_name} is not exist'}
        

    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in creating case {str(e)}"
        )
    
@app.get('/AI/{ai_name}/learning')
async def learning(request: Request, ai_name: str):
    try:
        data = models.Learn_ai(ai_name=ai_name)
        folder_path = os.path.join(data.base_path, data.ai_name)

        if os.path.exists(folder_path):
            info_path = os.path.join(folder_path, 'info.json')
            info = fs.elem_from_json_path(info_path)
        else:    
            return templates.TemplateResponse("notExist.html", {"request": request, "AI": data.ai_name})
        
        return templates.TemplateResponse("learning.html", {"request": request, "state": info['state'], "AI": data.ai_name, "folders": fs.get_list_directories(pathes.DIRECTORY_OF_NETWORKS_PATH)})
    
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in learning page {str(e)}"
        )
    

@app.post("/AI/learn-check")
async def learn_check(request: Request, data: models.Learn_ai):
    """
    надо проверять можем ли мы запускать (проверять статус), если нет, то status - denied
    """
    try:
        folder_path = os.path.join(data.base_path, data.ai_name)

        if os.path.exists(folder_path):

            info_path = os.path.join(folder_path, 'info.json')
            info = fs.elem_from_json_path(info_path)

            if info['state'] == 'ready':

                for len in info['lens']: #если датасет не закончен
                    if info['lens'][len] == 0:
                        return {'status': 'denied', 'message': f'case {len} is empty'}
                
                info['state'] = 'learning'
                fs.create_and_insert_json(info_path, info) #обозначение что нейросеть начинает учиться

                return {'status': 'accepted', 'name': data.ai_name} #тогда уже перенаправляем на обучение через ws
            else:
                return {'status': 'denied', 'message': f'AI is aleredy learning'}
        else:
            return {'status': 'notExist', 'message': f'Ai {data.ai_name} is not exist'}
        
    except Exception as e:

        info['status'] = 'ready'
        fs.create_and_insert_json(info_path, info)

        print(str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error in creating case {str(e)}"
        )
    
@app.websocket('/{ai_name}/learning')
async def websocket_endpoint(websocket: WebSocket, ai_name: str):
    learn_data = models.Learn_ai(
        ai_name=ai_name
    )

    folder_path = os.path.join(learn_data.base_path, learn_data.ai_name)
    info_path = os.path.join(folder_path, 'info.json')
    info = fs.elem_from_json_path(info_path)

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            iteratable = learn_nn(
                executable_path=pathes.EXECUTABLE_NEURAL_NETWORK_LEARN_PATH,
                ai_folder_path=os.path.join('networks', learn_data.ai_name),
                epoch=data['iterations'],
                delta=1,
                learning_rate=data['learning_rate'],
                network_hyperparameters=fs.elem_from_json_path(pathes.NETWORK_HYPERPARAMETERS_PATH)
            )
            
            for iter in iteratable:
                await websocket.send_json(iter)

            #end
            await websocket.send_json({'type': 'learned'})

    except WebSocketDisconnect as e:
        print(f"Client disconnected with code: {e.code}, reason: {e.reason}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        info['state'] = 'ready'
        fs.create_and_insert_json(info_path, info)
        print("Connection closed")