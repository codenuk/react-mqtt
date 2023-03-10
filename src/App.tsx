// Lib
import React, { useState, useEffect } from 'react'
import mqtt from 'mqtt/dist/mqtt'

// Include in project

const App: React.FC = () => {
  const [client, setClient] = useState<any>(null)
  const [connectStatus, setConnectStatus] = useState('Unconnect')

  const [formConnect, setFormConnect] = useState({
    host: '54.254.95.252',
    port: '8080',
    clientID: 'rftghjklpas;d',
    username: 'Mobile',
    password: 'dsflow',
  })
  const mqttConnect = () => {
    const url = `ws://${formConnect.host}:${formConnect.port}/mqtt`
    const options: any = {
      keepalive: 30,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      will: {
        topic: 'WillMsg',
        payload: 'Connection Closed abnormally..!',
        qos: 0,
        retain: false,
      },
      rejectUnauthorized: false,
      clientId: formConnect.clientID,
      username: formConnect.username,
      password: formConnect.password,
    }

    setConnectStatus('Connecting')
    setClient(mqtt.connect(url, options))
  }
  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus('Unconnect')
      })
    }
  }

  const [isSub, setIsSub] = useState(false)
  const [subscription, setSubscription] = useState({
    topic: '/output',
    qos: 0,
  })
  const mqttSub = () => {
    if (client) {
      const { topic, qos } = subscription
      client.subscribe(topic, { qos }, (error: any) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
        setIsSub(true)
      })
    }
  }
  const mqttUnSub = () => {
    if (client) {
      const { topic } = subscription
      client.unsubscribe(topic, (error: any) => {
        if (error) {
          console.log('Unsubscribe error', error)
          return
        }
        setIsSub(false)
      })
    }
  }

  const [context, setContext] = useState({
    topic: '/output',
    qos: 0,
    message: '',
  })
  const mqttPublish = () => {
    if (client) {
      const { topic, qos, message } = context
      client.publish(topic, message, { qos }, (error: any) => {
        if (error) {
          console.log('Publish error: ', error)
        }
      })
    }
  }

  const [payloads, setPayloads] = useState([])
  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        console.log('connect')
        setConnectStatus('Connected')
      })
      client.on('error', (err: any) => {
        console.error('Connection error: ', err)
        client.end()
      })
      client.on('reconnect', () => {
        console.log('reconnect')
        setConnectStatus('Reconnecting')
      })
      client.on('message', (topic: any, message: any) => {
        console.log('message')
        const payload = { topic, message: message.toString() }

        const clonePayloads: any = [...payloads]
        clonePayloads.push(payload)
        setPayloads(clonePayloads)
      })
    }
  }, [client, isSub, payloads])

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Connection - {connectStatus}</h2>
        <div className="body">
          <div className="wrapperInput">
            <p>Host</p>
            <input
              type="text"
              value={formConnect.host}
              onChange={(e) => setFormConnect((prev) => ({ ...prev, host: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>Port</p>
            <input
              type="text"
              value={formConnect.port}
              onChange={(e) => setFormConnect((prev) => ({ ...prev, port: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>Client ID</p>
            <input
              type="text"
              value={formConnect.clientID}
              onChange={(e) => setFormConnect((prev) => ({ ...prev, clientID: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>Username</p>
            <input
              type="text"
              value={formConnect.username}
              onChange={(e) => setFormConnect((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>Password</p>
            <input
              type="text"
              value={formConnect.password}
              onChange={(e) => setFormConnect((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
        </div>
        <div className="footer">
          <button type="button" onClick={mqttConnect}>
            Connect
          </button>
          <button type="button" onClick={mqttDisconnect}>
            Disconnect
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="title">Subscriptions - {isSub ? 'True' : 'False'}</h2>
        <div className="body">
          <div className="wrapperInput">
            <p>Topic</p>
            <input
              type="text"
              value={subscription.topic}
              onChange={(e) => setSubscription((prev) => ({ ...prev, topic: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>QoS</p>
            <input
              type="text"
              value={subscription.qos}
              onChange={(e) => setSubscription((prev) => ({ ...prev, qos: parseInt(e.target.value) }))}
            />
          </div>
        </div>
        <div className="footer">
          <button type="button" onClick={mqttSub}>
            Subscribe
          </button>
          <button type="button" onClick={mqttUnSub}>
            Unsubscribe
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="title">Publish</h2>
        <div className="body">
          <div className="wrapperInput">
            <p>Topic</p>
            <input
              type="text"
              value={context.topic}
              onChange={(e) => setContext((prev) => ({ ...prev, topic: e.target.value }))}
            />
          </div>
          <div className="wrapperInput">
            <p>QoS</p>
            <input
              type="text"
              value={context.qos}
              onChange={(e) => setContext((prev) => ({ ...prev, qos: parseInt(e.target.value) }))}
            />
          </div>
          <div className="wrapperInput">
            <p>Message</p>
            <input
              type="text"
              value={context.message}
              onChange={(e) => setContext((prev) => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </div>
        <div className="footer">
          <button type="button" onClick={mqttPublish}>
            Publish
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="title">Messages</h2>
        <div className="wrapperMsg">
          {payloads.length !== 0 ? (
            payloads.map((data: any, index) => (
              <div key={index} className="msg">
                <p>{data.topic}</p>
                <h3>{data.message}</h3>
              </div>
            ))
          ) : (
            <p>ไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
