from campay.sdk import Client as CamPayClient
campay = CamPayClient({
    "app_username": "JByBUneb4BceuEyoMu1nKlmyTgVomd-QfokOrs4t4B9tPJS7hhqUtpuxOx5EQ7zpT0xmYw3P6DU6LU0mH2DvaQ",
    "app_password": "m-Xuj9EQIT_zeQ5hSn8hLjYlyJT7KnSTHABYVp7tKeHKgsVnF0x6PEcdtZCVaDM0BN5mX-eylX0fhrGGMZBrWg",
    "environment": "PROD"  # use "DEV" for demo mode or "PROD" for live mode
})
app.route('/payment', methods=['POST'])
def payment():
    # Get the data from the form (sent via POST)
    data = request.get_json()
    print(data)
    phone = data['phone']
    amount = data['amount']

    if not phone or not amount:
        return jsonify({'error': 'Phone and amount are required.'}), 400

    collect = campay.collect({
        "amount": "5",  # The amount you want to collect
        "currency": "XAF",
        # Phone number to request amount from. Must include country code
        "from": "237" + phone,
        "description": "Eneo payment",
        # Reference from the system initiating the transaction.
        "external_reference": "",
    })
    print(collect)
    if collect.get('status') == 'SUCCESSFUL':
        payment_data = {
            'reference': collect.get('reference'),
            'external_reference': collect.get('external_reference'),
            'status': collect.get('status'),
            'amount': collect.get('amount'),
            'currency': collect.get('currency'),
            'operator': collect.get('operator'),
            'code': collect.get('code'),
            'operator_reference': collect.get('operator_reference'),
            'description': collect.get('description'),
            'external_user': collect.get('external_user'),
            'reason': collect.get('reason'),
            'phone_number': collect.get('phone_number')
        }
        return jsonify({'message': 'Payment successful!', 'payment': payment_data}), 200
    else:
        if collect.get('reason'):
            context = {'error': collect.get('reason')}
            return jsonify(context) , 400
        elif collect.get('message'):
            context = {'error': collect.get('message')}
            return jsonify(context) , 400
        else:
            context = {
                'error': 'An error occur with the payment please try later'}
            return jsonify(context) , 400