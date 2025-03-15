from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import time
from quantum_key_distribution import QuantumKeyDistribution

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Store transaction data and keys (In a real system, this would be a secure database)
transactions = {}
keys = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate_key', methods=['POST'])
def generate_key():
    """Generate a quantum key and return transaction ID"""
    data = request.json
    sender = data.get('sender')
    receiver = data.get('receiver')
    
    if not sender or not receiver:
        return jsonify({"error": "Sender and receiver are required"}), 400
    
    # Generate a transaction ID
    transaction_id = f"TXN-{int(time.time())}"
    
    # Create QKD instance and generate key
    qkd = QuantumKeyDistribution(key_length=64)  # Longer key for better security
    shared_key = qkd.bb84_protocol()
    
    # Store the key and transaction data
    keys[transaction_id] = {
        "key": shared_key,
        "alice_bits": qkd.alice_bits,
        "alice_bases": qkd.alice_bases,
        "bob_bases": qkd.bob_bases,
        "bob_results": qkd.bob_results
    }
    
    transactions[transaction_id] = {
        "sender": sender,
        "receiver": receiver,
        "status": "key_generated"
    }
    
    # In a real scenario, only the shared key would be stored securely
    # Other data is returned here for demonstration purposes
    return jsonify({
        "transaction_id": transaction_id,
        "shared_key_length": len(shared_key),
        "matching_bases_percentage": (len(shared_key) / qkd.key_length) * 100,
        "qkd_details": {
            "alice_bits": qkd.alice_bits,
            "alice_bases": qkd.alice_bases,
            "bob_bases": qkd.bob_bases,
            "bob_results": qkd.bob_results,
            "shared_key": shared_key
        }
    })

@app.route('/api/process_transaction', methods=['POST'])
def process_transaction():
    """Process a UPI transaction using the quantum key"""
    data = request.json
    transaction_id = data.get('transaction_id')
    amount = data.get('amount')
    
    if not transaction_id or not amount:
        return jsonify({"error": "Transaction ID and amount are required"}), 400
    
    if transaction_id not in keys or transaction_id not in transactions:
        return jsonify({"error": "Invalid transaction ID"}), 400
    
    # Get transaction data and key
    tx_data = transactions[transaction_id]
    key_data = keys[transaction_id]
    
    # Create QKD instance for encryption/decryption
    qkd = QuantumKeyDistribution()
    
    # Encrypt the transaction data
    tx_message = {
        "sender": tx_data["sender"],
        "receiver": tx_data["receiver"],
        "amount": float(amount),
        "timestamp": time.time()
    }
    
    # Convert message to JSON string first
    message_str = json.dumps(tx_message)
    
    # Encrypt the message
    encrypted_data = qkd.encrypt_message(message_str, key_data["key"])
    
    # In a real system, this would be sent to the receiver securely
    # For simulation, we'll decrypt it immediately
    decrypted_data = qkd.decrypt_message(encrypted_data, key_data["key"])
    
    # Update transaction status
    transactions[transaction_id]["status"] = "completed"
    transactions[transaction_id]["amount"] = float(amount)
    transactions[transaction_id]["encrypted_length"] = len(encrypted_data)
    
    return jsonify({
        "transaction_id": transaction_id,
        "status": "completed",
        "encrypted_data_length": len(encrypted_data),
        "decrypted_data": decrypted_data,
        "simulation": {
            "original_message": message_str,
            "encrypted_sample": encrypted_data[:20],  # Just show a sample
            "decryption_successful": message_str == decrypted_data
        }
    })

@app.route('/api/transaction_status/<transaction_id>', methods=['GET'])
def transaction_status(transaction_id):
    """Get the status of a transaction"""
    if transaction_id not in transactions:
        return jsonify({"error": "Invalid transaction ID"}), 400
    
    return jsonify({
        "transaction_id": transaction_id,
        "status": transactions[transaction_id]["status"],
        "details": transactions[transaction_id]
    })

if __name__ == '__main__':
    app.run(debug=True)