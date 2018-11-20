#samuel kyama muasya
#p15-42924/2017
import threading
from byzantine_functions import *


node_zero = Node(12345, False,[12346, 12347, 12348])
node_zero.send_commands([12346, 12347, 12348], "attack")
# print("total okay count ", node_zero.total_okay_count)

node_zero.listen_for_replies()
