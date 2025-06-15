import subprocess
import os
import fs
import random
import pathes

def start_process(program_path):

    process = subprocess.Popen(
        program_path,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    return process

def send_and_receive(process, message=''):
    if message:
        process.stdin.write(message + "\n")
        process.stdin.flush()

    response = process.stdout.readline().strip()
    return response

def close_process(process):

    if process:
        process.stdin.close()
        process.terminate()
        process.wait()


def run_child_process(executable_path, input_data):

    process = start_process(executable_path)

    stdout, stderr = process.communicate(input=input_data.encode())

    return_code = process.returncode

    return {
        'status_code': return_code, 
        'stdout': stdout.decode(), 
        'stderr': stderr.decode()
    }


def exec_nn(executable_path, full_folder_path, input_data_list, network_hyperparameters):

    input_data = " ".join([str(item) for item in network_hyperparameters['dims']]) + '\n'

    input_data += " ".join([str(item) for item in input_data_list]) + '\n'

    for i in range(1, network_hyperparameters['amount_of_dims']):
        input_data += " ".join([" ".join(str(item) for item in list) for list in fs.elem_from_json_path(os.path.join(full_folder_path, 'weights_and_basies', f'W{i}.json'))]) + '\n'

    if network_hyperparameters['basies']:
        for i in range(1, network_hyperparameters['amount_of_dims']):
            input_data += " ".join([" ".join(str(item) for item in list) for list in fs.elem_from_json_path(os.path.join(full_folder_path, 'weights_and_basies', f'B{i}.json'))]) + '\n'


    return run_child_process(executable_path, input_data)


def learn_nn(
    executable_path, 
    ai_folder_path, 
    epoch, 
    delta, 
    learning_rate, 
    network_hyperparameters 
): 
    data_set_path = os.path.join(ai_folder_path, 'data_set')
    WAB_path = os.path.join(ai_folder_path, 'weights_and_basies')
    info = fs.elem_from_json_path(os.path.join(ai_folder_path, 'info.json'))

    data_set = {}

    for answer in network_hyperparameters['answers']:
        data_set[answer] = []
        answer_data_set_path = os.path.join(data_set_path, answer)

        if not os.path.isdir(answer_data_set_path):
            continue

        case_files = sorted([f for f in os.listdir(answer_data_set_path) if f.startswith('case') and f.endswith('.json')])

        for case_file in case_files:
            case_path = os.path.join(answer_data_set_path, case_file)
            data_set[answer].append(fs.elem_from_json_path(case_path))

    weights_and_biases = {}
    for i in range(1, network_hyperparameters['amount_of_dims']):
        W_path = os.path.join(WAB_path, f'W{i}.json')
        B_path = os.path.join(WAB_path, f'B{i}.json')
        weights_and_biases[i] = {
            'W': fs.elem_from_json_path(W_path),
            'B': fs.elem_from_json_path(B_path)
        }

    input_data = " ".join([str(item) for item in network_hyperparameters['dims']]) + '\n'
    input_data += f"{epoch} {delta} {learning_rate}\n"

    for i in range(1, network_hyperparameters['amount_of_dims']):
        input_data += " ".join([" ".join(str(item) for item in list) for list in weights_and_biases[i]['W']]) + "\n"

    if network_hyperparameters['basies']:
        for i in range(1, network_hyperparameters['amount_of_dims']):
            input_data += " ".join([" ".join(str(item) for item in list) for list in weights_and_biases[i]['B']]) + "\n"

    process = start_process(executable_path)
    send_and_receive(process, input_data)

    for i in range(epoch):
        random_answer_index = random.randint(0, network_hyperparameters['amount_of_answers'] - 1)
        random_answer = network_hyperparameters['answers'][random_answer_index]
        
        random_input_data = random.choice(data_set[random_answer])

        answer_arr = list('0' * network_hyperparameters['amount_of_answers'])
        answer_arr[random_answer_index] = '1'
        input_data = " ".join(answer_arr) + '\n'
        input_data += " ".join([str(item) for item in random_input_data]) + '\n'
        CE = send_and_receive(process, input_data)

        yield ({'type': 'point', 'x': i, 'y': float(CE)})

    weights_and_biases = {
        'W1': [],
        'W2': [],
        'W3': [],
        'B1': [],
        'B2': [],
        'B3': []
    }

    # for W
    for i in range(3):
        for j in range(network_hyperparameters['dims'][i]):
            weights_and_biases[f'W{i + 1}'].append([float(elem) for elem in send_and_receive(process).split(' ')])
    # for B
    for i in range(3):
        weights_and_biases[f'B{i + 1}'].append([float(elem) for elem in send_and_receive(process).split(' ')])

    for key in weights_and_biases:
        file_path = os.path.join(WAB_path, f'{key}.json')
        fs.create_and_insert_json(
            file_path,
            weights_and_biases[key]
        )

    close_process(process)
