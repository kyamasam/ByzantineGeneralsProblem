import socket
import time
import re
r = re.compile(r"^\d*[.]?\d*$")
class Node:

    def __init__(self, port_number,is_traitor,other_nodes):
        self.port_number = port_number
        self.cs_status = 0
        self.server = self.start_server(port_number)
        # time.sleep(4)
        self.cs_intention_time = time.time()
        self.server.listen(1)
        self.received_time_data=''
        self.is_traitor = is_traitor
        self.other_nodes = other_nodes
        self.command_count = 0
        self.message_sent_to_self = False
    commands = []

    message_already_sent = False
    self_ok_count = 0
    total_okay_count = 0
    def connect_to_port(self, port_number):
        # create a reliable TCP/IP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # local hostname
        local_hostname = socket.gethostname()
        # full host name
        local_fqdn = socket.getfqdn()

        # get the according IP address
        ip_address = socket.gethostbyname(local_hostname)

        # bind the socket to the port 12345, and connect
        server_address = (ip_address, port_number)
        sock.connect(server_address)
        print("connected to ",server_address)
        return sock

    def send_message(self, port, message):
        sock = self.connect_to_port(port)
        print("sending message to ", port)
        sock.send(bytes(message, 'utf-8'))

    def send_commands(self, connection_ports, message):
        for port in connection_ports:
            sock = self.connect_to_port(port)
            # send the requests to each port
            sock.settimeout(5.0)
            sock.send(bytes(message, 'utf-8'))
            print("request sent to port", port)
            if port == 12348 or port == 12347:
                try:
                    data_from_server = sock.recv(64)
                    if data_from_server:
                        self.total_okay_count += 1
                        print("received message from 12348 ", data_from_server.decode('utf-8'))
                        self.commands.append(data_from_server.decode('utf-8'))
                        self.command_count += 1
                    else:
                        print("No okay message received")

                except socket.timeout:
                    print("Timed Out Before Any message was received. Assume critical section")

            else:
                pass

        print("finished sending all the requests to all ports")

        return self.port_number


    def check_critical_section(self):
        #check if this port is in cs
        if self.cs_status == 0:
            return False
        else:
            return True

    def listen_for_replies(self):

        while True:
            # wait for a connection
            print('waiting for a connection')
            connection, client_address = self.server.accept()
            try:
                print('connection from', client_address)
                # get the data in bits
                time.sleep(3)
                while True:
                    data = connection.recv(64)
                    # the message has been received from commander
                    if data:
                        time.sleep(2)
                        if self.command_count == 0:
                            print("message from commander is:", data.decode('utf-8'))
                            if self.is_traitor is False:
                                print("sending command received from commander")
                                self.send_commands(self.other_nodes, data.decode('utf-8'))
                            else:
                                print("sending command received from commander")
                                self.send_commands(self.other_nodes, "retreat")
                                print("traitor")
                        else:
                            print("appending received message")
                            self.commands.append(data.decode('utf-8'))
                            self.command_count += 1
                    else:
                        print("conditions not satisfied")
                        break


            # let's make sure this code is excecuted even in the case of an exception
            finally:
                # check if we have enough messages for consensus
                print("no of messages: ", len(self.commands))
                print("no of servers: ", len(self.other_nodes) +1)
                consensus = len(self.commands) / (len(self.other_nodes) + 1)
                if consensus >= 0.66666:
                    print("We have enough messages for consensus to be reached ", consensus)
                    print("my messages are as follows", self.commands)

                    max_value = max(set(self.commands), key=self.commands.count)
                    print("the set of max is", max_value)
                    counter = 0
                    for l in self.commands:
                        if (max_value == l):
                            counter += 1

                    if (counter / (len(self.other_nodes))) >= 0.66666:
                        print("we have reached a consensus ", max_value)
                    else:
                        print("could not reach consensus. ")

                else:
                    print("continue listening, not enough messages for consensus")
                print("wait for any other node to connect")

    def start_server(self, my_port):
        # create a reliable TCP/IP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        # get  local hostname
        local_hostname = socket.gethostname()

        # get complete domain name for this computer
        local_complete_domain_name = socket.getfqdn()

        # the ip address associated with the fqdn
        ip_address = socket.gethostbyname(local_hostname)

        # display hostname, domain name and IP address
        print("Details are as follows %s (%s) with %s" % (local_hostname, local_complete_domain_name, ip_address))

        # bind the socket to the port, Example : 12345
        server_address = (ip_address, my_port)
        print('Starting the server on %s port %s' % server_address)
        sock.bind(server_address)
        # listen for incoming connections (server mode) with one connection at a time

        return sock


