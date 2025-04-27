import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.primitives import Sampler
import random

class QuantumRandomNumberGenerator:
    def __init__(self):
        self.sampler = Sampler()
    
    def generate_random_bits(self, num_bits):
        """Generate truly random bits using quantum circuits"""
        random_bits = []
        
        for _ in range(num_bits):
            # Create a quantum circuit with one qubit
            qc = QuantumCircuit(1, 1)
            
            # Apply Hadamard gate to create superposition
            qc.h(0)
            
            # Measure the qubit
            qc.measure(0, 0)
            
            # Execute the circuit using Sampler
            result = self.sampler.run(qc, shots=1).result()
            
            # Extract the measurement result (0 or 1)
            bit = list(result.quasi_dists[0].keys())[0]
            random_bits.append(bit)
            
        return random_bits

class QuantumKeyDistribution:
    def __init__(self, key_length=32, use_qrng=True):
        self.key_length = key_length
        self.alice_bits = None
        self.alice_bases = None
        self.bob_bases = None
        self.bob_results = None
        self.shared_key = None
        self.sampler = Sampler()
        self.use_qrng = use_qrng
        if use_qrng:
            self.qrng = QuantumRandomNumberGenerator()
        
    def generate_random_bits(self, n):
        """Generate n random bits (0 or 1)"""
        if self.use_qrng:
            return self.qrng.generate_random_bits(n)
        else:
            return [random.randint(0, 1) for _ in range(n)]
    
    def generate_random_bases(self, n):
        """Generate n random bases (0 for Z-basis, 1 for X-basis)"""
        if self.use_qrng:
            return self.qrng.generate_random_bits(n)
        else:
            return [random.randint(0, 1) for _ in range(n)]
    
    def prepare_qubits(self, bits, bases):
        """Prepare qubits according to bits and bases"""
        qc_list = []
        for bit, basis in zip(bits, bases):
            qc = QuantumCircuit(1, 1)
            
            # If bit is 1, apply X gate
            if bit:
                qc.x(0)
                
            # If basis is 1 (X-basis), apply Hadamard gate
            if basis:
                qc.h(0)
                
            qc_list.append(qc)
            
        return qc_list
    
    def measure_qubits(self, qc_list, bases):
        """Measure qubits according to bases"""
        results = []
        
        for qc, basis in zip(qc_list, bases):
            # Create a new circuit with the same qubits
            meas_qc = qc.copy()
            
            # If measuring in X-basis, apply Hadamard gate
            if basis:
                meas_qc.h(0)
                
            # Measure qubit
            meas_qc.measure(0, 0)
            
            # Execute the circuit using Sampler
            result = self.sampler.run(meas_qc, shots=1).result()
            measured_bit = list(result.quasi_dists[0].keys())[0]
            results.append(measured_bit)
            
        return results
    
    def sift_keys(self):
        """Sift keys based on matching bases"""
        matching_indices = [i for i in range(self.key_length) 
                           if self.alice_bases[i] == self.bob_bases[i]]
        
        self.shared_key = [self.alice_bits[i] for i in matching_indices]
        return self.shared_key
    
    def bb84_protocol(self):
        """Execute the BB84 protocol"""
        # Step 1: Alice generates random bits and bases
        self.alice_bits = self.generate_random_bits(self.key_length)
        self.alice_bases = self.generate_random_bases(self.key_length)
        
        # Step 2: Alice prepares qubits
        qubits = self.prepare_qubits(self.alice_bits, self.alice_bases)
        
        # Step 3: Bob chooses random measurement bases
        self.bob_bases = self.generate_random_bases(self.key_length)
        
        # Step 4: Bob measures the qubits
        self.bob_results = self.measure_qubits(qubits, self.bob_bases)
        
        # Step 5: Alice and Bob sift their keys
        return self.sift_keys()
    
    def encrypt_message(self, message, key):
        """Encrypt a message using XOR with the key"""
        # Convert message to binary
        if isinstance(message, str):
            binary_message = ''.join(format(ord(c), '08b') for c in message)
        else:
            binary_message = bin(message)[2:]
            
        # Pad key if necessary by repeating it
        padded_key = key * (len(binary_message) // len(key) + 1)
        padded_key = padded_key[:len(binary_message)]
        
        # XOR the message with the key
        encrypted_bits = [int(m) ^ k for m, k in zip(binary_message, padded_key)]
        return encrypted_bits
    
    def decrypt_message(self, encrypted_bits, key):
        """Decrypt a message using XOR with the key"""
        # Pad key if necessary by repeating it
        padded_key = key * (len(encrypted_bits) // len(key) + 1)
        padded_key = padded_key[:len(encrypted_bits)]
        
        # XOR the encrypted message with the key
        decrypted_bits = [e ^ k for e, k in zip(encrypted_bits, padded_key)]
        
        # Convert binary back to string (assuming 8 bits per character)
        binary_str = ''.join(str(bit) for bit in decrypted_bits)
        
        # Try to convert to string if it was a string message
        try:
            chars = []
            for i in range(0, len(binary_str), 8):
                byte = binary_str[i:i+8]
                if len(byte) == 8:  # Make sure we have a full byte
                    chars.append(chr(int(byte, 2)))
            return ''.join(chars)
        except:
            # If conversion fails, return the binary
            return decrypted_bits