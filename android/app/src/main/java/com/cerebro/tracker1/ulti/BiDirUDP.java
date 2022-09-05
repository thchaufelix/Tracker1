package com.cerebro.tracker1.ulti;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketException;

public class BiDirUDP implements Runnable {
    public static final String TAG = "BiDirUDP";
    public static final String RECEIVE_ACTION = "GetUDPReceive";
    public static final String RECEIVE_STRING = "ReceiveString";
    public static final String RECEIVE_BYTES = "ReceiveBytes";

    private int remotePort;
    private final int connectionTimeout = 2000;
    private String remoteIp;
    private String msg;
    private static DatagramSocket clientSocket = null;
    private Context context;

    private boolean storeFail = false;

    //切換Port
    public void setRemotePort(int remotePort) {
        this.remotePort = remotePort;
    }

    public void setRemoteIp(String remoteIp) {
        this.remoteIp = remoteIp;
    }

    public void setMessage(String msg) {
        this.msg = msg;
    }

    public void setStoreFail(){this.storeFail = true;}

    /**
     * 初始化建構子
     */
    public BiDirUDP(String remoteIp, int remotePort, Context context) {
        this.context = context;
        this.remoteIp = remoteIp;
        this.remotePort = remotePort;

        try {
            clientSocket = new DatagramSocket();
            clientSocket.setSoTimeout(connectionTimeout);
        } catch (SocketException e) {
            e.printStackTrace();
        }

        Log.e(TAG, "Remote IP : " + remoteIp);

    }

    private void send(DatagramSocket clientSocket) throws IOException {
        InetAddress inetAddress = InetAddress.getByName(remoteIp);
        DatagramPacket dpSend = new DatagramPacket(msg.getBytes(), msg.getBytes().length, inetAddress, remotePort);
        clientSocket.send(dpSend);
//        clientSocket.close();
    }

    private void receive(DatagramSocket clientSocket) throws IOException {
        byte[] msgRcv = new byte[1024];
        DatagramPacket dpRcv = new DatagramPacket(msgRcv, msgRcv.length);
        clientSocket.receive(dpRcv);
//        clientSocket.close();

        messageHandler(dpRcv);
    }

    private void messageHandler(DatagramPacket dpRcv) {
        String string = new String(dpRcv.getData(), dpRcv.getOffset(), dpRcv.getLength());
        Intent intent = new Intent();
        intent.setAction(RECEIVE_ACTION);
        intent.putExtra(RECEIVE_STRING, string);
        intent.putExtra(RECEIVE_BYTES, dpRcv.getData());
        context.sendBroadcast(intent);
    }

    /**
     * 監聽執行緒
     */
    @Override
    public void run() {

        try {
            Log.e(TAG, "Sending To : " + remoteIp + ":" + remotePort);
            send(clientSocket);
        } catch (IOException e) {
            if(storeFail){
                StorageFunction.writeFileOnInternalStorage(context, msg, true);
            }
            Log.e(TAG, "send: " + e.toString());
        }

        try {
            Log.e(TAG, "Waiting Response From : " + remoteIp);
            receive(clientSocket);
        } catch (IOException e) {
//            e.printStackTrace();
            Log.e(TAG, "receive " + e.toString());
        }
    }
}