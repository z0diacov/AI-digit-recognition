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

def send_and_receive(process, message):

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

    stdout, stderr = process.communicate(input=input_data)

    return_code = process.returncode

    return {
        'status_code': return_code, 
        'stdout': stdout, 
        'stderr': stderr
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


    # int INPUT_DIM, H1_DIM, H2_DIM, OUT_DIM;
    # cin >> INPUT_DIM >> H1_DIM >> H2_DIM >> OUT_DIM;
    
    # int EPOCH;
    # int DELTA;
    # long double LEARNING_RATE;
    # cin >> EPOCH >> DELTA >> LEARNING_RATE;

    # Matrix W1(INPUT_DIM, H1_DIM);
    # Matrix W2(H1_DIM, H2_DIM);
    # Matrix W3(H2_DIM, OUT_DIM);
    # Matrix B1(1, H1_DIM);
    # Matrix B2(1, H2_DIM);
    # Matrix B3(1, OUT_DIM);

    # W1.init_from_stdin();
    # W2.init_from_stdin();
    # W3.init_from_stdin();
    # B1.init_from_stdin();
    # B2.init_from_stdin();
    # B3.init_from_stdin();

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

    input_data = " ".join([str(item) for item in network_hyperparameters['dims']]) + '\n'
    input_data += f"{epoch} {delta} {learning_rate}\n"

    for i in range(1, network_hyperparameters['amount_of_dims']):
        input_data += " ".join([" ".join(str(item) for item in list) for list in fs.elem_from_json_path(os.path.join(WAB_path, f'W{i}.json'))]) + "\n"

    if network_hyperparameters['basies']:
        for i in range(1, network_hyperparameters['amount_of_dims']):
            input_data += " ".join([" ".join(str(item) for item in list) for list in fs.elem_from_json_path(os.path.join(WAB_path, f'B{i}.json'))]) + "\n"

    process = start_process(executable_path)
    print(send_and_receive(process, input_data))

    for i in range(epoch):

        random_answer_index = random.randint(0, network_hyperparameters['amount_of_answers'] - 1)
        random_answer = network_hyperparameters['answers'][random_answer_index]
        random_data_set_path = os.path.join(data_set_path, random_answer)
        random_answer_data_set_index = random.randint(1, info['lens'][random_answer])
        random_input_data = fs.elem_from_json_path(os.path.join(random_data_set_path, f'case{random_answer_data_set_index}.json'))

        answer_arr = list('0' * network_hyperparameters['amount_of_answers'])
        answer_arr[random_answer_index] = '1'
        input_data = " ".join(answer_arr) + '\n'
        input_data += " ".join([str(item) for item in random_input_data]) + '\n'

        learn_data = send_and_receive(process, input_data)
        if i % 1000 == 0:
            print(learn_data)
    close_process(process)

# learn_nn(
#     pathes.EXECUTABLE_NEURAL_NETWORK_LEARN_PATH,
#     os.path.join('networks', 'main'),
#     1000000,
#     1,
#     0.05,
#     fs.elem_from_json_path(pathes.NETWORK_HYPERPARAMETERS_PATH)
# )

    