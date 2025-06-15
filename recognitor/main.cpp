#include <iostream>
#include <random>
#include <cmath>
#include <chrono>
#include <iomanip>

using namespace std;

long double random(int min, int max) {

    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> distrib(min, max);

    return (long double)distrib(gen);
}

double sigmoid(double x, bool is_derivative = false) {

    double sig = 1.0 / (1.0 + exp(-x)); 
    
    if (is_derivative) {
        return sig * (1 - sig);
    }
    
    return sig;
}

struct Matrix {

    long double** data;
    size_t rows,
           cols;

    Matrix(size_t r, size_t c, bool feel_zero=true) : rows(r), cols(c) {

        this->data = new long double*[this->rows];

        for (size_t i = 0; i < this->rows; i++) {

            this->data[i] = new long double[this->cols];

        }

        if (feel_zero) {

            for (size_t i = 0; i < this->rows; i++) {

                for (size_t j = 0; j < this->cols; j++) {

                    this->data[i][j] = 0;

                }

            }

        }
    }

    Matrix(const Matrix& other) : rows(other.rows), cols(other.cols) { //copy constructor

        this->data = new long double*[this->rows];

        for (size_t i = 0; i < this->rows; i++) {

            this->data[i] = new long double[this->cols];

            for(size_t j = 0; j < this->cols; j++) {

                this->data[i][j] = other.data[i][j];

            }

        }

    }

    ~Matrix() {

        for (size_t i = 0; i < this->rows; i++) delete[] this->data[i];
        delete[] this->data;

    }

    void print(bool print_str=false) {

        for (size_t i = 0; i < this->rows; i++) {

            if (print_str) cout << i << " : ";

            for (size_t j = 0; j < this->cols; j++) {
 
                cout << setprecision(20) << this->data[i][j] << ' ';

            }

            cout << endl;

        }

    }

    void randomize(double min=-1.0, double max=1.0) {

        for (size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {
 
                this->data[i][j] = random(min, max);

            }

        }
    }

    Matrix T() { //matrix transpose

        Matrix result(this->cols, this->rows, false);

        for(size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                result.data[j][i] = this->data[i][j];

            }

        }

        return result;

    }


    Matrix operator=(const Matrix& other) { 

        if (this == &other) return *this; 

        for (size_t i = 0; i < this->rows; i++) {

            delete[] this->data[i];

        }

        delete[] this->data;

        this->rows = other.rows;
        this->cols = other.cols;
        this->data = new long double*[this->rows];

        for (size_t i = 0; i < this->rows; i++) {

            this->data[i] = new long double[this->cols];

            for(size_t j = 0; j < this->cols; j++) { 

                this->data[i][j] = other.data[i][j];

            }

        }
        return *this;
    }

    template<typename T, typename = enable_if_t<is_arithmetic_v<T>>>

    Matrix operator*(const T scalar) const {

        Matrix result(this->rows, this->cols, false);

        for (size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = this->data[i][j] * scalar;

            }

        }

        return result;

    }

    Matrix operator*(const Matrix& other) const {

        if (this->cols != other.rows) {

            throw invalid_argument("Amount of cols must equal amount of rows for multiplying matrixes");

        }   


        Matrix result(this->rows, other.cols, false);

        for (size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < other.cols; j++) {

                result.data[i][j] = 0;

                for(size_t k = 0; k < this->cols; k++) {

                    result.data[i][j] += (this->data[i][k] * other.data[k][j]);

                }
            }
        }

        return result;

    }

        Matrix operator^(const Matrix& other) const { // ^ - Hadamard product

        if (this->rows != other.rows || this->cols != other.cols) {

            throw invalid_argument("Matrices must be of the same dimension (operator ^)\n");

        }

        Matrix result(this->rows, this->cols, false);

        for(size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = this->data[i][j] * other.data[i][j];

            }
        }

        return result;
    }

    Matrix operator+(const Matrix& other) const { 

        if (this->rows != other.rows || this->cols != other.cols) {

            throw invalid_argument("Matrices must be of the same dimension\n");

        }

        Matrix result(this->rows, this->cols, false);

        for(size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = this->data[i][j] + other.data[i][j];

            }
        }

        return result;
    }

    Matrix operator-(const Matrix& other) const { 

        if (this->rows != other.rows || this->cols != other.cols) {

            throw invalid_argument("Matrices must be of the same dimension (operator -)\n");

        }

        Matrix result(this->rows, this->cols, false);

        for(size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = this->data[i][j] - other.data[i][j];

            }
        }

        return result;
    }

    Matrix operator-=(const Matrix& other) { 

        if (this->rows != other.rows || this->cols != other.cols) {

            throw invalid_argument("Matrices must be of the same dimension (operator -=)\n");

        }

        for(size_t i = 0; i < this->rows; i++) {

            for (size_t j = 0; j < this->cols; j++) {

                this->data[i][j] -= other.data[i][j];

            }
        }

        return *this;

    }
    

    Matrix sigmoid(bool is_derivative = false) const {

        Matrix result(this->rows, this->cols, false);

        for (size_t i = 0; i < this->rows; i++) {
            
            for(size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = ::sigmoid(this->data[i][j], is_derivative);

            }
        }

        return result;

    }

    long double max_elem() const {

        long double max_elem = this->data[0][0];

        for (size_t i = 0; i < this->rows; i++) {

            for (size_t j = 1; j < this->cols; j++) {

                if (this->data[i][j] > max_elem) {
                    
                    max_elem = this->data[i][j];

                }

            }
            
        }

        return max_elem;
    
    }

    Matrix softmax() const {

        Matrix result(this->rows, this->cols, false);

        long double exp_sum = 0.0f;
        //long double max_elem = this->max_elem();

        for (size_t i = 0; i < this->rows; i++) {
            
            for(size_t j = 0; j < this->cols; j++) {

                result.data[i][j] = exp(this->data[i][j]);
                exp_sum += result.data[i][j];
            }
        }

        for (size_t i = 0; i < this->rows; i++) {
            
            for(size_t j = 0; j < this->cols; j++) {

                result.data[i][j] /= exp_sum;

            }
        }

        return result;

    }

    void init_from_stdin(size_t r=0, size_t c=0) {

        for (size_t i = 0; i < this->rows; i++) {

            delete[] this->data[i];

        }

        delete[] this->data;

        if (r != 0) {
            this->rows = r;
        }

        if (c != 0) {
            this->cols = c;
        }
        
        this->data = new long double*[this->rows];

        for (size_t i = 0; i < this->rows; i++) {

            this->data[i] = new long double[this->cols];

            for(size_t j = 0; j < this->cols; j++) { 

                cin >> this->data[i][j];

            }

        }
    }
    
};



int main() {

    
    int INPUT_DIM, H1_DIM, H2_DIM, OUT_DIM;
    cin >> INPUT_DIM >> H1_DIM >> H2_DIM >> OUT_DIM;

    Matrix W1(INPUT_DIM, H1_DIM);
    Matrix W2(H1_DIM, H2_DIM);
    Matrix W3(H2_DIM, OUT_DIM);
    Matrix B1(1, H1_DIM);
    Matrix B2(1, H2_DIM);
    Matrix B3(1, OUT_DIM);

    Matrix X(1, INPUT_DIM);

    X.init_from_stdin();
    W1.init_from_stdin();
    W2.init_from_stdin();
    W3.init_from_stdin();
    B1.init_from_stdin();
    B2.init_from_stdin();
    B3.init_from_stdin();

    Matrix T1 = X * W1 + B1;
    Matrix H1 = T1.sigmoid();
    Matrix T2 = H1 * W2 + B2;
    Matrix H2 = T2.sigmoid();
    Matrix T3 = H2 * W3 + B3;
    Matrix Z = T3.softmax();

    Z.print();
}